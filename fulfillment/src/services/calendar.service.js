const { google } = require('googleapis');
require('dotenv').config();
const { formatForCalendar, addDuration, formatDateISO } = require('../utils/dateHelpers');

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const TIMEZONE = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Lima';
const SLOT_DURATION = parseInt(process.env.APPOINTMENT_SLOT_DURATION_MINUTES) || 60;

class CalendarService {
	constructor() {
		this.calendar = null;
		this.initialized = false;
	}

	/**
	 * Initializes Google Calendar API client
	 * @returns {Promise<void>}
	 */
	async initialize() {
		if (this.initialized) return;

		try {
			const auth = new google.auth.GoogleAuth({
				keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
				scopes: ['https://www.googleapis.com/auth/calendar'],
			});

			const authClient = await auth.getClient();
			this.calendar = google.calendar({ version: 'v3', auth: authClient });
			this.initialized = true;

			console.log('[CalendarService] Google Calendar API initialized');
		} catch (error) {
			console.error('[CalendarService] Error initializing Calendar API:', error);
			throw error;
		}
	}

	/**
	 * Creates an event in Google Calendar
	 * @param {Object} appointmentData - Appointment data
	 * @returns {Promise<string>} Event ID
	 */
	async createEvent(appointmentData) {
		await this.initialize();

		const {
			clientName,
			phone,
			equipmentType,
			problemDescription,
			scheduledDate,
			scheduledTime,
			appointmentType,
			address,
		} = appointmentData;

		const startDateTime = formatForCalendar(scheduledDate, scheduledTime);
		const endDateTime = addDuration(scheduledDate, scheduledTime, SLOT_DURATION);

		let description = `Cliente: ${clientName}\nTeléfono: ${phone}\nEquipo: ${equipmentType}\nProblema: ${problemDescription}`;

		if (appointmentType === 'domicilio') {
			description += `\nTipo: Servicio a domicilio\nDirección: ${address}`;
		}

		const event = {
			summary: `Cita - ${clientName} (${equipmentType})`,
			description: description,
			start: {
				dateTime: startDateTime,
				timeZone: TIMEZONE,
			},
			end: {
				dateTime: endDateTime,
				timeZone: TIMEZONE,
			},
			reminders: {
				useDefault: false,
				overrides: [
					{ method: 'email', minutes: 24 * 60 },
					{ method: 'popup', minutes: 30 },
				],
			},
		};

		try {
			const response = await this.calendar.events.insert({
				calendarId: CALENDAR_ID,
				resource: event,
			});

			console.log(
				`[CalendarService] Event created: ${response.data.id} for ${clientName}`,
			);
			return response.data.id;
		} catch (error) {
			console.error('[CalendarService] Error creating event:', error);
			throw error;
		}
	}

	/**
	 * Checks if a time slot is available
	 * @param {Date} date - Date to check
	 * @param {string} time - Time in HH:MM format
	 * @returns {Promise<boolean>} True if available
	 */
	async checkAvailability(date, time) {
		await this.initialize();

		const startDateTime = formatForCalendar(date, time);
		const endDateTime = addDuration(date, time, SLOT_DURATION);

		try {
			const response = await this.calendar.events.list({
				calendarId: CALENDAR_ID,
				timeMin: startDateTime,
				timeMax: endDateTime,
				singleEvents: true,
				orderBy: 'startTime',
			});

			const events = response.data.items || [];
			return events.length === 0;
		} catch (error) {
			console.error('[CalendarService] Error checking availability:', error);
			return false;
		}
	}

	/**
	 * Lists available time slots for a given date
	 * @param {Date} date - Date to check
	 * @param {Object} businessHours - Business hours configuration
	 * @returns {Promise<Array<string>>} Array of available time slots in HH:MM format
	 */
	async listAvailableSlots(date, businessHours) {
		await this.initialize();

		const dayOfWeek = date.getDay();
		let startHour, endHour;

		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			startHour = 9;
			endHour = 18;
		} else if (dayOfWeek === 6) {
			startHour = 9;
			endHour = 13;
		} else {
			return [];
		}

		const slots = [];
		const dateISO = formatDateISO(date);

		for (let hour = startHour; hour < endHour; hour++) {
			const timeSlot = `${String(hour).padStart(2, '0')}:00`;
			const isAvailable = await this.checkAvailability(date, timeSlot);

			if (isAvailable) {
				slots.push(timeSlot);
			}
		}

		return slots;
	}

	/**
	 * Deletes an event from Google Calendar
	 * @param {string} eventId - Event ID to delete
	 * @returns {Promise<boolean>} True if successful
	 */
	async deleteEvent(eventId) {
		await this.initialize();

		if (!eventId) {
			console.warn('[CalendarService] No event ID provided for deletion');
			return false;
		}

		try {
			await this.calendar.events.delete({
				calendarId: CALENDAR_ID,
				eventId: eventId,
			});

			console.log(`[CalendarService] Event deleted: ${eventId}`);
			return true;
		} catch (error) {
			console.error('[CalendarService] Error deleting event:', error);
			return false;
		}
	}

	/**
	 * Updates an existing event
	 * @param {string} eventId - Event ID to update
	 * @param {Object} updates - Updated event data
	 * @returns {Promise<boolean>} True if successful
	 */
	async updateEvent(eventId, updates) {
		await this.initialize();

		if (!eventId) {
			console.warn('[CalendarService] No event ID provided for update');
			return false;
		}

		try {
			const response = await this.calendar.events.patch({
				calendarId: CALENDAR_ID,
				eventId: eventId,
				resource: updates,
			});

			console.log(`[CalendarService] Event updated: ${eventId}`);
			return true;
		} catch (error) {
			console.error('[CalendarService] Error updating event:', error);
			return false;
		}
	}

	/**
	 * Gets the number of appointments in a time slot
	 * @param {Date} date - Date to check
	 * @param {string} time - Time in HH:MM format
	 * @returns {Promise<number>} Number of appointments
	 */
	async getSlotCount(date, time) {
		await this.initialize();

		const startDateTime = formatForCalendar(date, time);
		const endDateTime = addDuration(date, time, SLOT_DURATION);

		try {
			const response = await this.calendar.events.list({
				calendarId: CALENDAR_ID,
				timeMin: startDateTime,
				timeMax: endDateTime,
				singleEvents: true,
			});

			return (response.data.items || []).length;
		} catch (error) {
			console.error('[CalendarService] Error getting slot count:', error);
			return 0;
		}
	}
}

const calendarService = new CalendarService();

module.exports = calendarService;
