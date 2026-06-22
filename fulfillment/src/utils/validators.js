require('dotenv').config();

/**
 * Validates a Peruvian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function validatePhone(phone) {
	if (!phone) return false;

	const cleanPhone = phone.replace(/\D/g, '');

	if (cleanPhone.length === 9) {
		return cleanPhone.startsWith('9');
	}

	if (cleanPhone.length === 11) {
		return cleanPhone.startsWith('519');
	}

	if (cleanPhone.length === 12) {
		return cleanPhone.startsWith('+519');
	}

	return false;
}

/**
 * Normalizes phone number to 9-digit format
 * @param {string} phone - Phone number to normalize
 * @returns {string} Normalized phone number
 */
function normalizePhone(phone) {
	if (!phone) return '';

	const cleanPhone = phone.replace(/\D/g, '');

	if (cleanPhone.length === 9) {
		return cleanPhone;
	}

	if (cleanPhone.length === 11 && cleanPhone.startsWith('519')) {
		return cleanPhone.substring(2);
	}

	if (cleanPhone.length === 12 && cleanPhone.startsWith('+519')) {
		return cleanPhone.substring(3);
	}

	return cleanPhone;
}

/**
 * Validates that a date is in the future and within allowed booking window
 * @param {Date} date - Date to validate
 * @param {number} maxDays - Maximum days ahead allowed
 * @returns {Object} { valid: boolean, message: string }
 */
function validateDate(date, maxDays = 7) {
	if (!date || !(date instanceof Date) || isNaN(date)) {
		return {
			valid: false,
			message: 'La fecha no es válida.',
		};
	}

	const now = new Date();
	now.setHours(0, 0, 0, 0);

	const targetDate = new Date(date);
	targetDate.setHours(0, 0, 0, 0);

	if (targetDate < now) {
		return {
			valid: false,
			message: 'La fecha ya pasó. Por favor, elija una fecha futura.',
		};
	}

	const maxDate = new Date(now);
	maxDate.setDate(maxDate.getDate() + maxDays);

	if (targetDate > maxDate) {
		return {
			valid: false,
			message: `La fecha está fuera del rango permitido (próximos ${maxDays} días).`,
		};
	}

	if (targetDate.getDay() === 0) {
		return {
			valid: false,
			message: 'Los domingos no atendemos. Por favor, elija otro día.',
		};
	}

	return { valid: true, message: '' };
}

/**
 * Validates that a time is within business hours
 * @param {string} time - Time in HH:MM format
 * @param {Date} date - Date for the appointment
 * @returns {Object} { valid: boolean, message: string }
 */
function validateTime(time, date) {
	if (!time) {
		return {
			valid: false,
			message: 'La hora no es válida.',
		};
	}

	const timeParts = time.split(':');
	if (timeParts.length < 2) {
		return {
			valid: false,
			message: 'Formato de hora inválido.',
		};
	}

	const hours = parseInt(timeParts[0]);
	const minutes = parseInt(timeParts[1]);

	if (isNaN(hours) || isNaN(minutes)) {
		return {
			valid: false,
			message: 'La hora no es válida.',
		};
	}

	const dayOfWeek = date.getDay();

	if (dayOfWeek >= 1 && dayOfWeek <= 5) {
		if (hours < 9 || hours >= 18) {
			return {
				valid: false,
				message: 'Para días de semana, el horario de atención es de 9:00 AM a 6:00 PM.',
			};
		}
	} else if (dayOfWeek === 6) {
		if (hours < 9 || hours >= 13) {
			return {
				valid: false,
				message: 'Para sábados, el horario de atención es de 9:00 AM a 1:00 PM.',
			};
		}
	} else {
		return {
			valid: false,
			message: 'Los domingos no atendemos.',
		};
	}

	return { valid: true, message: '' };
}

/**
 * Basic validation for address
 * @param {string} address - Address to validate
 * @returns {Object} { valid: boolean, message: string }
 */
function validateAddress(address) {
	if (!address || typeof address !== 'string') {
		return {
			valid: false,
			message: 'No logré captar la dirección. ¿Podría escribirla nuevamente?',
		};
	}

	const trimmedAddress = address.trim();

	if (trimmedAddress.length < 10) {
		return {
			valid: false,
			message:
				'La dirección parece estar incompleta. ¿Podría incluir más detalles? Por ejemplo: manzana, lote, asentamiento humano o nombre de la calle.',
		};
	}

	if (trimmedAddress.length > 200) {
		return {
			valid: false,
			message:
				'La dirección es demasiado extensa. ¿Podría resumirla un poco e incluir solo los datos principales?',
		};
	}

	return { valid: true, message: '' };
}

/**
 * Normalizes text by removing accents for comparison
 * @param {string} text - Text to normalize
 * @returns {string} Text without accents in lowercase
 */
function normalizeText(text) {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}

/**
 * Validates that an address is within coverage area (Provincia de Paita).
 * Uses a blacklist strategy: assumes the address is local unless it
 * explicitly mentions a city or province outside Paita.
 * @param {string} address - Address to validate
 * @returns {Object} { valid: boolean, message: string }
 */
function validateCoverageArea(address) {
	if (!address || typeof address !== 'string') {
		return {
			valid: false,
			message: 'No logré captar la dirección. ¿Podría escribirla nuevamente?',
		};
	}

	const addressNormalized = normalizeText(address);

	const excludedLocations = [
		'lima',
		'callao',
		'arequipa',
		'trujillo',
		'chiclayo',
		'piura ciudad',
		'castilla',
		'catacaos',
		'26 de octubre',
		'sullana',
		'talara',
		'sechura',
		'morropon',
		'ayabaca',
		'huancabamba',
		'chulucanas',
		'tumbes',
		'cajamarca',
		'lambayeque',
		'la libertad',
		'ica',
		'cusco',
		'cuzco',
		'huancayo',
		'pucallpa',
		'iquitos',
		'tacna',
		'moquegua',
		'puno',
		'moyobamba',
		'chimbote',
	];

	const isExcluded = excludedLocations.some((loc) => addressNormalized.includes(loc));

	if (isExcluded) {
		return {
			valid: false,
			message:
				'Lamentablemente nuestro servicio a domicilio solo cubre la zona de Paita por el momento. 😔 ¿Podría proporcionarme una dirección dentro de Paita? Si lo prefiere, también puede traer su equipo a nuestro local.',
		};
	}

	return { valid: true, message: '' };
}

/**
 * Validates equipment type
 * @param {string} equipmentType - Equipment type to validate
 * @returns {boolean} True if valid
 */
function validateEquipmentType(equipmentType) {
	const validTypes = ['PC', 'laptop', 'impresora', 'camara', 'monitor', 'otro'];
	return validTypes.includes(equipmentType);
}

/**
 * Validates an email address format
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, message: string }
 */
function validateEmail(email) {
	if (!email || typeof email !== 'string') {
		return {
			valid: false,
			message:
				'El correo electrónico no parece válido. ¿Podría verificarlo e ingresarlo nuevamente?',
		};
	}

	const trimmed = email.trim().toLowerCase();
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(trimmed)) {
		return {
			valid: false,
			message:
				'Ese correo no parece estar bien escrito. ¿Podría verificarlo? Ejemplo: nombre@correo.com',
		};
	}

	return { valid: true, message: '' };
}

/**
 * Validates selection index against available options.
 * Handles numeric strings ("1", "2") and descriptive ordinal phrases
 * in Spanish ("la primera", "la segunda", "opcion 2", etc.).
 * @param {string|number} input - User input (number or text)
 * @param {number} maxOptions - Maximum number of options
 * @returns {number|null} Selected index (0-based) or null if invalid
 */
function parseSelectionIndex(input, maxOptions) {
	if (!input) return null;

	const trimmed = String(input).trim();

	// Direct numeric input
	const num = parseInt(trimmed);
	if (!isNaN(num) && num >= 1 && num <= maxOptions) {
		return num - 1;
	}

	// Descriptive ordinal text in Spanish
	const normalized = trimmed
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');

	const ordinalMap = {
		primera: 1,
		primero: 1,
		primer: 1,
		uno: 1,
		segunda: 2,
		segundo: 2,
		dos: 2,
		tercera: 3,
		tercero: 3,
		tres: 3,
		cuarta: 4,
		cuarto: 4,
		cuatro: 4,
		quinta: 5,
		quinto: 5,
		cinco: 5,
	};

	for (const [word, n] of Object.entries(ordinalMap)) {
		if (normalized.includes(word) && n <= maxOptions) {
			return n - 1;
		}
	}

	// "opcion N" or "opción N" pattern
	const opcionMatch = normalized.match(/opci[oa]n\s+(\d+)/);
	if (opcionMatch) {
		const n = parseInt(opcionMatch[1]);
		if (n >= 1 && n <= maxOptions) return n - 1;
	}

	return null;
}

module.exports = {
	validatePhone,
	normalizePhone,
	validateDate,
	validateTime,
	validateAddress,
	validateCoverageArea,
	validateEquipmentType,
	validateEmail,
	parseSelectionIndex,
};
