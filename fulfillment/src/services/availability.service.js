require('dotenv').config();
const calendarService = require('./calendar.service');
const { getNextBusinessDays } = require('../utils/dateHelpers');
const { BUSINESS_HOURS } = require('../config/constants');

const MAX_BOOKING_DAYS = parseInt(process.env.MAX_BOOKING_DAYS) || 7;
const MAX_SIMULTANEOUS = parseInt(process.env.MAX_SIMULTANEOUS_APPOINTMENTS) || 3;

class AvailabilityService {
	/**
	 * Gets available dates within the booking window
	 * @param {number} maxDays - Maximum days to look ahead
	 * @returns {Array<Date>} Array of available dates
	 */
	getAvailableDates(maxDays = MAX_BOOKING_DAYS) {
		return getNextBusinessDays(maxDays);
	}

	/**
	 * Gets available time slots for a specific date.
	 * Uses a single Calendar API call to fetch all events for the day,
	 * then counts overlaps per slot locally.
	 * @param {Date} date - Date to check
	 * @returns {Promise<Array<string>>} Array of available time slots in HH:MM format
	 */
	async getAvailableSlots(date) {
		if (!date || !(date instanceof Date)) {
			console.error('[AvailabilityService] Invalid date provided');
			return [];
		}

		const dayOfWeek = date.getDay();

		if (dayOfWeek === 0) {
			console.log('[AvailabilityService] No slots available on Sundays');
			return [];
		}

		let startHour, endHour;

		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			startHour = 9;
			endHour = 18;
		} else if (dayOfWeek === 6) {
			startHour = 9;
			endHour = 13;
		}

		try {
			// Single API call for the entire business day
			const events = await calendarService.listEventsForDay(date, startHour, endHour);

			const availableSlots = [];

			for (let hour = startHour; hour < endHour; hour++) {
				const slotStart = new Date(date);
				slotStart.setHours(hour, 0, 0, 0);
				const slotEnd = new Date(slotStart);
				slotEnd.setMinutes(slotEnd.getMinutes() + 60);

				// Count events that overlap with this slot
				const overlapping = events.filter((event) => {
					const eventStart = new Date(event.start.dateTime || event.start.date);
					const eventEnd = new Date(event.end.dateTime || event.end.date);
					return eventStart < slotEnd && eventEnd > slotStart;
				});

				if (overlapping.length < MAX_SIMULTANEOUS) {
					availableSlots.push(`${String(hour).padStart(2, '0')}:00`);
				}
			}

			console.log(
				`[AvailabilityService] Found ${availableSlots.length} available slots for ${date.toDateString()}`
			);
			return availableSlots;
		} catch (error) {
			console.error('[AvailabilityService] Error getting available slots:', error);
			return this.getDefaultSlots(dayOfWeek);
		}
	}

	/**
	 * Gets default time slots when Calendar API is unavailable
	 * @param {number} dayOfWeek - Day of week (0-6)
	 * @returns {Array<string>} Default time slots
	 */
	getDefaultSlots(dayOfWeek) {
		if (dayOfWeek === 0) return [];

		if (dayOfWeek === 6) {
			return ['09:00', '10:00', '11:00', '12:00'];
		}

		return ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
	}

	/**
	 * Checks if a specific date and time is within business hours
	 * @param {Date} date - Date to check
	 * @param {string} time - Time in HH:MM format
	 * @returns {boolean} True if within business hours
	 */
	isWithinBusinessHours(date, time) {
		if (!date || !time) return false;

		const dayOfWeek = date.getDay();

		if (dayOfWeek === 0) return false;

		const timeParts = time.split(':');
		const hours = parseInt(timeParts[0]);

		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			return hours >= 9 && hours < 18;
		} else if (dayOfWeek === 6) {
			return hours >= 9 && hours < 13;
		}

		return false;
	}

	/**
	 * Checks if a slot is fully booked
	 * @param {Date} date - Date to check
	 * @param {string} time - Time in HH:MM format
	 * @returns {Promise<boolean>} True if fully booked
	 */
	async isSlotFullyBooked(date, time) {
		try {
			const slotCount = await calendarService.getSlotCount(date, time);
			return slotCount >= MAX_SIMULTANEOUS;
		} catch (error) {
			console.error('[AvailabilityService] Error checking if slot is full:', error);
			return false;
		}
	}

	/**
	 * Gets the next available date with open slots
	 * @returns {Promise<Date|null>} Next available date or null
	 */
	async getNextAvailableDate() {
		const dates = this.getAvailableDates();

		for (const date of dates) {
			const slots = await this.getAvailableSlots(date);
			if (slots.length > 0) {
				return date;
			}
		}

		return null;
	}

	/**
	 * Gets business hours for a specific day
	 * @param {Date} date - Date to get hours for
	 * @returns {Object|null} Business hours object or null
	 */
	getBusinessHoursForDate(date) {
		if (!date || !(date instanceof Date)) return null;

		const dayOfWeek = date.getDay();

		if (dayOfWeek === 0) {
			return BUSINESS_HOURS.sunday;
		} else if (dayOfWeek === 6) {
			return BUSINESS_HOURS.saturday;
		} else {
			return BUSINESS_HOURS.weekday;
		}
	}

	/**
	 * Validates that appointment can be created for given date/time
	 * @param {Date} date - Appointment date
	 * @param {string} time - Appointment time
	 * @returns {Promise<Object>} Validation result
	 */
	async validateAppointmentSlot(date, time) {
		if (!this.isWithinBusinessHours(date, time)) {
			return {
				valid: false,
				message: 'El horario seleccionado está fuera del horario de atención.',
			};
		}

		const isFullyBooked = await this.isSlotFullyBooked(date, time);
		if (isFullyBooked) {
			return {
				valid: false,
				message: 'El horario seleccionado ya no está disponible.',
			};
		}

		return {
			valid: true,
			message: 'Horario disponible.',
		};
	}
}

const availabilityService = new AvailabilityService();

module.exports = availabilityService;
