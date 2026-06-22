const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const MONTHS_ES = [
	'enero',
	'febrero',
	'marzo',
	'abril',
	'mayo',
	'junio',
	'julio',
	'agosto',
	'septiembre',
	'octubre',
	'noviembre',
	'diciembre',
];

/**
 * Formats a date in Spanish readable format
 * @param {Date} date - Date to format
 * @returns {string} Formatted date (e.g., "Lunes 10 de febrero")
 */
function formatDate(date) {
	if (!date || !(date instanceof Date)) return '';

	const dayName = DAYS_ES[date.getDay()];
	const dayNumber = date.getDate();
	const monthName = MONTHS_ES[date.getMonth()];

	return `${dayName} ${dayNumber} de ${monthName}`;
}

/**
 * Formats time in 12-hour format
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time (e.g., "10:00 AM")
 */
function formatTime(time) {
	if (!time) return '';

	const timeParts = time.split(':');
	if (timeParts.length < 2) return time;

	let hours = parseInt(timeParts[0]);
	const minutes = timeParts[1];

	const ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12;

	return `${hours}:${minutes} ${ampm}`;
}

/**
 * Gets the next N business days (excluding Sundays)
 * @param {number} count - Number of business days to get
 * @returns {Array<Date>} Array of Date objects
 */
function getNextBusinessDays(count) {
	const businessDays = [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	let currentDate = new Date(today);
	currentDate.setDate(currentDate.getDate() + 1);

	while (businessDays.length < count) {
		if (currentDate.getDay() !== 0) {
			businessDays.push(new Date(currentDate));
		}
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return businessDays;
}

/**
 * Parses a Dialogflow date string to Date object
 * @param {string} dateString - Date string from Dialogflow
 * @returns {Date|null} Parsed date or null
 */
function parseDialogflowDate(dateString) {
	if (!dateString) return null;

	try {
		const date = new Date(dateString);
		if (isNaN(date)) return null;
		return date;
	} catch (error) {
		console.error('Error parsing Dialogflow date:', error);
		return null;
	}
}

/**
 * Parses a Dialogflow time string to HH:MM format
 * @param {string} timeString - Time string from Dialogflow
 * @returns {string} Time in HH:MM format
 */
function parseDialogflowTime(timeString) {
	if (!timeString) return '';

	try {
		if (timeString.includes('T')) {
			// Extract hours:minutes directly from the ISO string to avoid
			// server-timezone issues (getHours() returns local time, not the
			// timezone encoded in the string).
			const timeMatch = timeString.match(/T(\d{2}):(\d{2})/);
			if (timeMatch) {
				return `${timeMatch[1]}:${timeMatch[2]}`;
			}
		}

		if (timeString.match(/^\d{1,2}:\d{2}/)) {
			const parts = timeString.split(':');
			const hours = String(parseInt(parts[0])).padStart(2, '0');
			const minutes = parts[1].padStart(2, '0');
			return `${hours}:${minutes}`;
		}

		return timeString;
	} catch (error) {
		console.error('Error parsing Dialogflow time:', error);
		return '';
	}
}

/**
 * Checks if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
function isToday(date) {
	if (!date || !(date instanceof Date)) return false;

	const today = new Date();
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}

/**
 * Checks if a date is tomorrow
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is tomorrow
 */
function isTomorrow(date) {
	if (!date || !(date instanceof Date)) return false;

	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);

	return (
		date.getDate() === tomorrow.getDate() &&
		date.getMonth() === tomorrow.getMonth() &&
		date.getFullYear() === tomorrow.getFullYear()
	);
}

/**
 * Gets a relative date label (today, tomorrow, day name)
 * @param {Date} date - Date to get label for
 * @returns {string} Relative date label
 */
function getRelativeDateLabel(date) {
	if (!date || !(date instanceof Date)) return '';

	if (isToday(date)) return 'Hoy';
	if (isTomorrow(date)) return 'Mañana';

	return DAYS_ES[date.getDay()];
}

/**
 * Builds an ISO 8601 datetime string with explicit Peru timezone offset (-05:00).
 * This avoids relying on the server's local timezone for setHours/toISOString.
 * @param {Date} date - Date (only year/month/day are used)
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {string} ISO formatted datetime with -05:00 offset
 */
function buildLimaISO(date, hours, minutes) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const h = String(hours).padStart(2, '0');
	const m = String(minutes).padStart(2, '0');
	return `${year}-${month}-${day}T${h}:${m}:00-05:00`;
}

/**
 * Formats a date for Google Calendar ISO format with Peru timezone offset
 * @param {Date} date - Date to format
 * @param {string} time - Time in HH:MM format
 * @returns {string} ISO formatted datetime with -05:00 offset
 */
function formatForCalendar(date, time) {
	if (!date || !(date instanceof Date)) return '';

	const timeParts = time ? time.split(':') : ['09', '00'];
	const hours = parseInt(timeParts[0]) || 9;
	const minutes = parseInt(timeParts[1]) || 0;

	return buildLimaISO(date, hours, minutes);
}

/**
 * Adds duration (in minutes) to a datetime
 * @param {Date} date - Date
 * @param {string} time - Time in HH:MM format
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} ISO formatted datetime with -05:00 offset
 */
function addDuration(date, time, durationMinutes) {
	if (!date || !(date instanceof Date)) return '';

	const timeParts = time ? time.split(':') : ['09', '00'];
	let hours = parseInt(timeParts[0]) || 9;
	let minutes = parseInt(timeParts[1]) || 0;

	minutes += durationMinutes;
	hours += Math.floor(minutes / 60);
	minutes = minutes % 60;

	return buildLimaISO(date, hours, minutes);
}

/**
 * Formats a date to YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDateISO(date) {
	if (!date || !(date instanceof Date)) return '';

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

module.exports = {
	formatDate,
	formatTime,
	getNextBusinessDays,
	parseDialogflowDate,
	parseDialogflowTime,
	isToday,
	isTomorrow,
	getRelativeDateLabel,
	formatForCalendar,
	addDuration,
	formatDateISO,
};
