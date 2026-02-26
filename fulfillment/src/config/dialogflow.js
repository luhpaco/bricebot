const faqHandler = require('../handlers/faq.handler');
const appointmentsHandler = require('../handlers/appointments.handler');
const quotesHandler = require('../handlers/quotes.handler');

const INTENT_MAP = new Map([
	// Utility intents
	['saludo', faqHandler.handleGreeting],
	['despedida', faqHandler.handleGoodbye],
	['ayuda', faqHandler.handleHelp],
	['Default Fallback Intent', faqHandler.handleFallback],
	['derivar_agente_humano', faqHandler.handleDerivarAgente],

	// FAQ intents
	['faq_horarios', faqHandler.handleHorarios],
	['faq_ubicacion', faqHandler.handleUbicacion],
	['faq_contacto', faqHandler.handleContacto],
	['faq_redes_sociales', faqHandler.handleRedesSociales],

	// Appointments - Local
	['cita_iniciar', appointmentsHandler.handleAppointmentInitiate],
	['cita_local_iniciar', appointmentsHandler.handleLocalAppointmentStart],
	['cita_local_equipo', appointmentsHandler.handleLocalEquipmentType],
	['cita_local_problema', appointmentsHandler.handleLocalProblemDescription],
	['cita_local_nombre', appointmentsHandler.handleLocalClientName],
	['cita_local_telefono', appointmentsHandler.handleLocalClientPhone],
	['cita_local_fecha', appointmentsHandler.handleLocalDateSelection],
	['cita_local_hora', appointmentsHandler.handleLocalTimeSelection],
	['cita_local_confirmar_si', appointmentsHandler.handleLocalConfirmYes],
	['cita_local_confirmar_no', appointmentsHandler.handleLocalConfirmNo],

	// Appointments - Home Service
	['cita_domicilio_iniciar', appointmentsHandler.handleHomeAppointmentStart],
	['cita_domicilio_equipo', appointmentsHandler.handleHomeEquipmentType],
	['cita_domicilio_problema', appointmentsHandler.handleHomeProblemDescription],
	['cita_domicilio_nombre', appointmentsHandler.handleHomeClientName],
	['cita_domicilio_telefono', appointmentsHandler.handleHomeClientPhone],
	['cita_domicilio_direccion', appointmentsHandler.handleHomeAddress],
	['cita_domicilio_fecha', appointmentsHandler.handleHomeDateSelection],
	['cita_domicilio_rango_horario', appointmentsHandler.handleHomeTimeRange],
	['cita_domicilio_confirmar_si', appointmentsHandler.handleHomeConfirmYes],
	['cita_domicilio_confirmar_no', appointmentsHandler.handleHomeConfirmNo],

	// Quotes
	['cotizar_iniciar', quotesHandler.handleQuoteInitiate],
	['cotizar_producto_categoria', quotesHandler.handleQuoteProductCategory],
	['cotizar_servicio_tipo', quotesHandler.handleQuoteServiceType],
	['cotizar_servicio_equipo', quotesHandler.handleQuoteServiceEquipment],
	['cotizar_servicio_seleccionar', quotesHandler.handleQuoteServiceSelect],
	['cotizar_producto_generico', quotesHandler.handleQuoteGenericProduct],
	['cotizar_computadora', quotesHandler.handleQuoteComputer],
	['cotizar_computadora_uso', quotesHandler.handleQuoteComputerUse],
	['cotizar_computadora_seleccionar', quotesHandler.handleQuoteComputerSelect],
	['cotizar_repuesto_laptop', quotesHandler.handleQuoteLaptopPart],
	['cotizar_repuesto_seleccionar', quotesHandler.handleQuotePartSelect],
	['cotizar_agregar_mas', quotesHandler.handleQuoteAddMore],
	['cotizar_datos_cliente', quotesHandler.handleQuoteClientData],
	['cotizar_confirmar_si', quotesHandler.handleQuoteConfirmYes],
	['cotizar_confirmar_no', quotesHandler.handleQuoteConfirmNo],
]);

module.exports = { INTENT_MAP };
