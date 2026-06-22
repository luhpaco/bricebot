const Appointment = require('../models/Appointment');
const calendarService = require('../services/calendar.service');
const availabilityService = require('../services/availability.service');
const {
	validatePhone,
	normalizePhone,
	validateDate,
	validateTime,
	validateAddress,
	validateCoverageArea,
} = require('../utils/validators');
const { parseDialogflowDate, parseDialogflowTime } = require('../utils/dateHelpers');
const {
	formatAppointmentSummary,
	formatAvailableSlots,
	formatAvailableDates,
	formatAppointmentConfirmation,
	formatEquipmentTypes,
	formatTimeRanges,
} = require('../utils/formatters');
const { MESSAGES, CONTEXT_NAMES } = require('../config/constants');

const ALL_APPOINTMENT_CONTEXT_NAMES = CONTEXT_NAMES.APPOINTMENT;
const ALL_QUOTE_CONTEXT_NAMES = CONTEXT_NAMES.QUOTE;

const HOME_STEP_CONTEXT_NAMES = [
	'cita_domicilio_paso_equipo',
	'cita_domicilio_paso_problema',
	'cita_domicilio_paso_nombre',
	'cita_domicilio_paso_telefono',
	'cita_domicilio_paso_direccion',
	'cita_domicilio_paso_fecha',
	'cita_domicilio_paso_horario',
];

/**
 * Clears all home service step contexts
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
function clearHomePasoContexts(agent) {
	HOME_STEP_CONTEXT_NAMES.forEach((name) => {
		agent.context.set({ name, lifespan: 0, parameters: {} });
	});
}

/**
 * Handles appointment initiation
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleAppointmentInitiate = (agent) => {
	// C4: Clear all active contexts (appointments and quotes) before starting fresh
	ALL_APPOINTMENT_CONTEXT_NAMES.forEach((name) => {
		agent.context.set({ name, lifespan: 0, parameters: {} });
	});
	ALL_QUOTE_CONTEXT_NAMES.forEach((name) => {
		agent.context.set({ name, lifespan: 0, parameters: {} });
	});

	agent.context.set({
		name: 'cita_seleccion_tipo',
		lifespan: 5,
		parameters: {
			startTime: Date.now(),
		},
	});

	agent.add(MESSAGES.APPOINTMENT_TYPE_ASK);
};

/**
 * Handles local appointment initiation
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleLocalAppointmentStart = (agent) => {
	const context = agent.context.get('cita_seleccion_tipo');
	const startTime = context?.parameters?.startTime || Date.now();

	agent.context.set({
		name: 'cita_local_en_curso',
		lifespan: 10,
		parameters: {
			appointmentType: 'local',
			startTime: startTime,
		},
	});

	agent.add(formatEquipmentTypes());
};

/**
 * Handles equipment type selection for local appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleLocalEquipmentType = (agent) => {
	const context = agent.context.get('cita_local_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const equipmentType = agent.parameters['tipo_equipo'];

	agent.context.set({
		name: 'cita_local_en_curso',
		lifespan: 10,
		parameters: {
			...context.parameters,
			equipmentType: equipmentType,
		},
	});

	const article = ['laptop', 'impresora', 'camara'].includes(equipmentType) ? 'una' : 'un';
	agent.add(
		`Perfecto, ${article} ${equipmentType}. Cuénteme, ¿qué problema presenta o qué servicio necesita?\n\n(Ejemplo: "No enciende", "Pantalla rota", "Necesita mantenimiento")`
	);
};

/**
 * Handles problem description for local appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleLocalProblemDescription = (agent) => {
	const context = agent.context.get('cita_local_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const problemDescription = agent.parameters['descripcion_problema'] || agent.query;

	agent.context.set({
		name: 'cita_local_en_curso',
		lifespan: 10,
		parameters: {
			...context.parameters,
			problemDescription: problemDescription,
		},
	});

	agent.add(
		`Ya veo, "${problemDescription}". No se preocupe, vamos a ayudarle con eso. 💪\n\nPara agendar su cita, necesito algunos datos. ¿Me comparte su nombre completo?\n(Ejemplo: Juan Pérez López)`
	);
};

/**
 * Handles client name for local appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleLocalClientName = (agent) => {
	const context = agent.context.get('cita_local_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const rawName = agent.parameters['nombre_cliente'];
	const clientName =
		(rawName && typeof rawName === 'object' ? rawName.name : rawName) || agent.query;

	agent.context.set({
		name: 'cita_local_en_curso',
		lifespan: 10,
		parameters: {
			...context.parameters,
			clientName: clientName,
		},
	});

	agent.add(
		`Mucho gusto, ${clientName}. 😊 ¿A qué número de teléfono podemos contactarlo?\n(9 dígitos, ejemplo: 987654321)`
	);
};

/**
 * Handles client phone for local appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleLocalClientPhone = async (agent) => {
	const context = agent.context.get('cita_local_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	let phone = agent.parameters['telefono'] || agent.query;

	const phoneValidation = validatePhone(phone);
	if (!phoneValidation) {
		agent.add(MESSAGES.INVALID_PHONE);
		return;
	}

	phone = normalizePhone(phone);

	agent.context.set({
		name: 'cita_local_en_curso',
		lifespan: 10,
		parameters: {
			...context.parameters,
			phone: phone,
		},
	});

	const availableDates = availabilityService.getAvailableDates();
	const formattedDates = formatAvailableDates(availableDates);

	agent.add(`¡Gracias! Ya casi terminamos. 📅\n\n${formattedDates}`);
};

/**
 * Handles date selection for local appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleLocalDateSelection = async (agent) => {
	const context = agent.context.get('cita_local_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const dateString = agent.parameters['fecha'];
	const date = parseDialogflowDate(dateString);

	if (!date) {
		agent.add(MESSAGES.INVALID_DATE);
		return;
	}

	const dateValidation = validateDate(date);
	if (!dateValidation.valid) {
		agent.add(dateValidation.message);
		return;
	}

	agent.context.set({
		name: 'cita_local_en_curso',
		lifespan: 10,
		parameters: {
			...context.parameters,
			scheduledDate: date.toISOString(),
		},
	});

	try {
		const availableSlots = await availabilityService.getAvailableSlots(date);

		if (availableSlots.length === 0) {
			agent.add(
				'Lamentablemente no nos quedan horarios disponibles para ese día. 😔 ¿Le gustaría intentar con otra fecha?'
			);
			return;
		}

		const formattedSlots = formatAvailableSlots(availableSlots);
		agent.add(formattedSlots);
	} catch (error) {
		console.error('[AppointmentsHandler] Error getting available slots:', error);
		agent.add(
			'Disculpe, tuvimos un problema al consultar los horarios. ¿Podría intentarlo una vez más?'
		);
	}
};

/**
 * Handles time selection for local appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleLocalTimeSelection = async (agent) => {
	const context = agent.context.get('cita_local_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const timeString = agent.parameters['hora'];
	const time = parseDialogflowTime(timeString);
	const dateString = context.parameters.scheduledDate;
	const date = new Date(dateString);

	if (!time) {
		agent.add('Esa hora no parece ser válida. ¿Podría ingresarla nuevamente?');
		return;
	}

	const timeValidation = validateTime(time, date);
	if (!timeValidation.valid) {
		agent.add(timeValidation.message);
		return;
	}

	const slotValidation = await availabilityService.validateAppointmentSlot(date, time);
	if (!slotValidation.valid) {
		agent.add(slotValidation.message);
		return;
	}

	// Save parameters before clearing, because agent.context.set() mutates
	// the object returned by agent.context.get() (same reference).
	const savedParams = { ...context.parameters };

	// Clear cita_local_en_curso so only cita_local_confirmar is active,
	// preventing ambiguous intent matching during confirmation
	agent.context.set({ name: 'cita_local_en_curso', lifespan: 0, parameters: {} });

	agent.context.set({
		name: 'cita_local_confirmar',
		lifespan: 3,
		parameters: {
			...savedParams,
			scheduledTime: time,
		},
	});

	const appointmentData = {
		clientName: savedParams.clientName,
		phone: savedParams.phone,
		equipmentType: savedParams.equipmentType,
		problemDescription: savedParams.problemDescription,
		scheduledDate: date,
		scheduledTime: time,
		appointmentType: 'local',
	};

	const summary = formatAppointmentSummary(appointmentData);
	agent.add(summary);
};

/**
 * Handles confirmation of local appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleLocalConfirmYes = async (agent) => {
	const context = agent.context.get('cita_local_confirmar');

	// M1: Guard against missing context
	if (!context) {
		agent.add(
			'Lo siento, no encontré la información de su cita. Por favor, inicie el proceso nuevamente.'
		);
		return;
	}

	const startTime = context.parameters.startTime;

	try {
		const appointmentData = {
			clientName: context.parameters.clientName,
			phone: context.parameters.phone,
			equipmentType: context.parameters.equipmentType,
			serviceType: 'Servicio técnico',
			problemDescription: context.parameters.problemDescription,
			appointmentType: 'local',
			scheduledDate: new Date(context.parameters.scheduledDate),
			scheduledTime: context.parameters.scheduledTime,
			status: 'confirmada',
			creationStartTime: new Date(startTime),
			creationEndTime: new Date(),
			creationDurationMs: Date.now() - startTime,
			createdByChatbot: true,
		};

		const referenceNumber = await Appointment.generateReferenceNumber();
		appointmentData.referenceNumber = referenceNumber;

		try {
			const eventId = await calendarService.createEvent(appointmentData);
			appointmentData.googleCalendarEventId = eventId;
		} catch (calendarError) {
			console.error('[AppointmentsHandler] Error creating calendar event:', calendarError);
		}

		const appointment = new Appointment(appointmentData);
		await appointment.save();

		const confirmationMessage = formatAppointmentConfirmation(appointment);
		agent.add(confirmationMessage);

		// C5: Delete ALL appointment contexts including cita_seleccion_tipo
		agent.context.delete('cita_local_confirmar');
		agent.context.delete('cita_local_en_curso');
		agent.context.delete('cita_seleccion_tipo');
	} catch (error) {
		console.error('[AppointmentsHandler] Error creating appointment:', error);
		agent.add(MESSAGES.APPOINTMENT_ERROR);
	}
};

/**
 * Handles cancellation/modification of local appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleLocalConfirmNo = (agent) => {
	const context = agent.context.get('cita_local_confirmar');

	// M1: Guard against missing context
	if (!context) {
		agent.add(
			'Lo siento, no encontré la información de su cita. Por favor, inicie el proceso nuevamente.'
		);
		return;
	}

	// Save parameters before clearing (context.set mutates the get() reference)
	const savedParams = { ...context.parameters };

	// C5: Delete stale contexts
	agent.context.delete('cita_seleccion_tipo');
	agent.context.set({ name: 'cita_local_confirmar', lifespan: 0, parameters: {} });

	agent.context.set({
		name: 'cita_local_en_curso',
		lifespan: 10,
		parameters: savedParams,
	});

	agent.add(
		'Sin problema. ¿Qué le gustaría hacer?\n\n1️⃣ Cambiar la fecha u hora\n2️⃣ Empezar una cita nueva desde cero'
	);
};

/**
 * Handles home service appointment initiation
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeAppointmentStart = (agent) => {
	const context = agent.context.get('cita_seleccion_tipo');
	const startTime = context?.parameters?.startTime || Date.now();

	agent.context.set({
		name: 'cita_domicilio_en_curso',
		lifespan: 12,
		parameters: {
			appointmentType: 'domicilio',
			startTime: startTime,
		},
	});
	agent.context.set({ name: 'cita_domicilio_paso_equipo', lifespan: 2, parameters: {} });

	agent.add(formatEquipmentTypes());
};

/**
 * Handles equipment type for home service
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeEquipmentType = (agent) => {
	const context = agent.context.get('cita_domicilio_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const equipmentType = agent.parameters['tipo_equipo'];

	agent.context.set({
		name: 'cita_domicilio_en_curso',
		lifespan: 12,
		parameters: {
			...context.parameters,
			equipmentType: equipmentType,
		},
	});
	agent.context.set({ name: 'cita_domicilio_paso_problema', lifespan: 2, parameters: {} });

	const article = ['laptop', 'impresora', 'camara'].includes(equipmentType) ? 'una' : 'un';
	agent.add(
		`Bien, ${article} ${equipmentType}. ¿Me puede describir qué problema tiene o qué servicio necesita?\n\n(Ejemplo: "No enciende", "Pantalla rota", "Necesita mantenimiento")`
	);
};

/**
 * Handles problem description for home service
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeProblemDescription = (agent) => {
	const context = agent.context.get('cita_domicilio_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const problemDescription = agent.parameters['descripcion_problema'] || agent.query;

	agent.context.set({
		name: 'cita_domicilio_en_curso',
		lifespan: 12,
		parameters: {
			...context.parameters,
			problemDescription: problemDescription,
		},
	});
	agent.context.set({ name: 'cita_domicilio_paso_nombre', lifespan: 2, parameters: {} });

	agent.add(
		`Entiendo, "${problemDescription}". Nos encargaremos de eso. 🔧\n\nPara coordinar la visita, necesito algunos datos. ¿Cuál es su nombre completo?\n(Ejemplo: Juan Pérez López)`
	);
};

/**
 * Handles client name for home service
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeClientName = (agent) => {
	const context = agent.context.get('cita_domicilio_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const rawName = agent.parameters['nombre_cliente'];
	const clientName =
		(rawName && typeof rawName === 'object' ? rawName.name : rawName) || agent.query;

	agent.context.set({
		name: 'cita_domicilio_en_curso',
		lifespan: 12,
		parameters: {
			...context.parameters,
			clientName: clientName,
		},
	});
	agent.context.set({ name: 'cita_domicilio_paso_telefono', lifespan: 2, parameters: {} });

	agent.add(
		`Gracias, ${clientName}. 😊 ¿Me indica su número de teléfono para coordinar la visita?\n(9 dígitos, ejemplo: 987654321)`
	);
};

/**
 * Handles client phone for home service
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeClientPhone = (agent) => {
	const context = agent.context.get('cita_domicilio_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	let phone = agent.parameters['telefono'] || agent.query;

	const phoneValidation = validatePhone(phone);
	if (!phoneValidation) {
		agent.context.set({ name: 'cita_domicilio_paso_telefono', lifespan: 2, parameters: {} });
		agent.add(MESSAGES.INVALID_PHONE);
		return;
	}

	phone = normalizePhone(phone);

	agent.context.set({
		name: 'cita_domicilio_en_curso',
		lifespan: 12,
		parameters: {
			...context.parameters,
			phone: phone,
		},
	});
	agent.context.set({ name: 'cita_domicilio_paso_direccion', lifespan: 2, parameters: {} });

	agent.add(
		'¡Listo! Ahora, para poder llegar hasta usted, necesito su dirección completa. ¿Dónde podemos recoger su equipo? 🏠\n(Ejemplo: Av. Grau 123, Paita)'
	);
};

/**
 * Handles address for home service
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeAddress = (agent) => {
	const context = agent.context.get('cita_domicilio_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const address = agent.parameters['direccion'] || agent.query;
	const reference = agent.parameters['referencia'] || '';

	const addressValidation = validateAddress(address);
	if (!addressValidation.valid) {
		agent.context.set({
			name: 'cita_domicilio_en_curso',
			lifespan: 12,
			parameters: context.parameters,
		});
		agent.context.set({ name: 'cita_domicilio_paso_direccion', lifespan: 2, parameters: {} });
		agent.add(addressValidation.message);
		return;
	}

	const coverageValidation = validateCoverageArea(address);
	if (!coverageValidation.valid) {
		agent.context.set({
			name: 'cita_domicilio_en_curso',
			lifespan: 12,
			parameters: context.parameters,
		});
		agent.context.set({ name: 'cita_domicilio_paso_direccion', lifespan: 2, parameters: {} });
		agent.add(coverageValidation.message);
		return;
	}

	agent.context.set({
		name: 'cita_domicilio_en_curso',
		lifespan: 12,
		parameters: {
			...context.parameters,
			address: address,
			addressReference: reference,
		},
	});
	agent.context.set({ name: 'cita_domicilio_paso_fecha', lifespan: 2, parameters: {} });

	const availableDates = availabilityService.getAvailableDates();
	const formattedDates = formatAvailableDates(availableDates);

	agent.add(`¡Perfecto, ya tenemos su dirección! Ahora elijamos la fecha. 📅\n\n${formattedDates}`);
};

/**
 * Handles date selection for home service
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeDateSelection = (agent) => {
	const context = agent.context.get('cita_domicilio_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}
	const dateString = agent.parameters['fecha'];
	const date = parseDialogflowDate(dateString);

	if (!date) {
		agent.context.set({ name: 'cita_domicilio_paso_fecha', lifespan: 2, parameters: {} });
		agent.add(MESSAGES.INVALID_DATE);
		return;
	}

	const dateValidation = validateDate(date);
	if (!dateValidation.valid) {
		agent.context.set({ name: 'cita_domicilio_paso_fecha', lifespan: 2, parameters: {} });
		agent.add(dateValidation.message);
		return;
	}

	agent.context.set({
		name: 'cita_domicilio_en_curso',
		lifespan: 12,
		parameters: {
			...context.parameters,
			scheduledDate: date.toISOString(),
		},
	});
	agent.context.set({ name: 'cita_domicilio_paso_horario', lifespan: 2, parameters: {} });

	const timeRanges = formatTimeRanges();
	agent.add(timeRanges);
};

/**
 * Handles time range selection for home service
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeTimeRange = async (agent) => {
	const context = agent.context.get('cita_domicilio_en_curso');
	if (!context) {
		agent.add('Su sesión ha expirado. Por favor, inicie el proceso de cita nuevamente.');
		return;
	}

	const rangoHorario = agent.parameters['rango_horario'] || agent.query.toLowerCase();

	let timeRange;
	if (rangoHorario.includes('mañana') || rangoHorario.includes('manana') || rangoHorario === '1') {
		timeRange = 'mañana';
	} else if (rangoHorario.includes('tarde') || rangoHorario === '2') {
		timeRange = 'tarde';
	} else {
		agent.context.set({ name: 'cita_domicilio_paso_horario', lifespan: 2, parameters: {} });
		agent.add(
			'¿Podría indicarme si prefiere en la mañana o en la tarde? Son las dos opciones disponibles.'
		);
		return;
	}

	const scheduledTime = timeRange === 'mañana' ? '10:00' : '15:00';
	const date = new Date(context.parameters.scheduledDate);

	// Validate slot availability against Google Calendar
	const slotValidation = await availabilityService.validateAppointmentSlot(date, scheduledTime);
	if (!slotValidation.valid) {
		agent.context.set({ name: 'cita_domicilio_paso_horario', lifespan: 2, parameters: {} });
		agent.add(slotValidation.message + '\n\n¿Prefiere en la mañana (10:00) o en la tarde (15:00)?');
		return;
	}

	// Save parameters before clearing (context.set mutates the get() reference)
	const savedParams = { ...context.parameters };

	// Clear cita_domicilio_en_curso so only cita_domicilio_confirmar is active,
	// preventing ambiguous intent matching during confirmation
	agent.context.set({ name: 'cita_domicilio_en_curso', lifespan: 0, parameters: {} });
	clearHomePasoContexts(agent);

	agent.context.set({
		name: 'cita_domicilio_confirmar',
		lifespan: 3,
		parameters: {
			...savedParams,
			scheduledTime,
			timeRange: timeRange,
		},
	});

	const appointmentData = {
		clientName: savedParams.clientName,
		phone: savedParams.phone,
		equipmentType: savedParams.equipmentType,
		problemDescription: savedParams.problemDescription,
		scheduledDate: date,
		scheduledTime,
		appointmentType: 'domicilio',
		address: savedParams.address,
		addressReference: savedParams.addressReference,
	};

	const summary = formatAppointmentSummary(appointmentData);
	agent.add(summary);
};

/**
 * Handles confirmation of home service appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeConfirmYes = async (agent) => {
	const context = agent.context.get('cita_domicilio_confirmar');

	// M1: Guard against missing context
	if (!context) {
		agent.add(
			'Lo siento, no encontré la información de su cita. Por favor, inicie el proceso nuevamente.'
		);
		return;
	}

	const startTime = context.parameters.startTime;

	try {
		const appointmentData = {
			clientName: context.parameters.clientName,
			phone: context.parameters.phone,
			equipmentType: context.parameters.equipmentType,
			serviceType: 'Servicio a domicilio',
			problemDescription: context.parameters.problemDescription,
			appointmentType: 'domicilio',
			scheduledDate: new Date(context.parameters.scheduledDate),
			scheduledTime: context.parameters.scheduledTime,
			address: context.parameters.address,
			addressReference: context.parameters.addressReference || null,
			status: 'confirmada',
			creationStartTime: new Date(startTime),
			creationEndTime: new Date(),
			creationDurationMs: Date.now() - startTime,
			createdByChatbot: true,
		};

		const referenceNumber = await Appointment.generateReferenceNumber();
		appointmentData.referenceNumber = referenceNumber;

		try {
			const eventId = await calendarService.createEvent(appointmentData);
			appointmentData.googleCalendarEventId = eventId;
		} catch (calendarError) {
			console.error('[AppointmentsHandler] Error creating calendar event:', calendarError);
		}

		const appointment = new Appointment(appointmentData);
		await appointment.save();

		const confirmationMessage = formatAppointmentConfirmation(appointment);
		agent.add(confirmationMessage);

		// C5 + A4: Delete ALL appointment contexts on successful confirmation
		agent.context.delete('cita_domicilio_confirmar');
		agent.context.delete('cita_domicilio_en_curso');
		agent.context.delete('cita_seleccion_tipo');
		clearHomePasoContexts(agent);
	} catch (error) {
		console.error('[AppointmentsHandler] Error creating appointment:', error);
		agent.add(MESSAGES.APPOINTMENT_ERROR);
	}
};

/**
 * Handles cancellation/modification of home service appointment
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHomeConfirmNo = (agent) => {
	const context = agent.context.get('cita_domicilio_confirmar');

	// M1: Guard against missing context
	if (!context) {
		agent.add(
			'Lo siento, no encontré la información de su cita. Por favor, inicie el proceso nuevamente.'
		);
		return;
	}

	// Save parameters before clearing (context.set mutates the get() reference)
	const savedParams = { ...context.parameters };

	// C5 + A4: Delete selection and all step contexts before re-entering the flow
	agent.context.delete('cita_seleccion_tipo');
	agent.context.set({ name: 'cita_domicilio_confirmar', lifespan: 0, parameters: {} });
	clearHomePasoContexts(agent);

	agent.context.set({
		name: 'cita_domicilio_en_curso',
		lifespan: 12,
		parameters: savedParams,
	});

	agent.add(
		'Sin problema. ¿Qué le gustaría hacer?\n\n1️⃣ Cambiar la fecha u horario\n2️⃣ Cambiar la dirección\n3️⃣ Empezar una cita nueva desde cero'
	);
};

module.exports = {
	handleAppointmentInitiate,
	handleLocalAppointmentStart,
	handleLocalEquipmentType,
	handleLocalProblemDescription,
	handleLocalClientName,
	handleLocalClientPhone,
	handleLocalDateSelection,
	handleLocalTimeSelection,
	handleLocalConfirmYes,
	handleLocalConfirmNo,
	handleHomeAppointmentStart,
	handleHomeEquipmentType,
	handleHomeProblemDescription,
	handleHomeClientName,
	handleHomeClientPhone,
	handleHomeAddress,
	handleHomeDateSelection,
	handleHomeTimeRange,
	handleHomeConfirmYes,
	handleHomeConfirmNo,
};
