require('dotenv').config();

const MESSAGES = {
	// Greetings
	WELCOME:
		'¡Hola! 👋 Bienvenido a CBRICENHO, su aliado en soluciones tecnológicas.\n\nSoy su asistente virtual y estoy aquí para ayudarle. Puede consultarme sobre:\n\n📋 Información del negocio (horarios, ubicación, contacto)\n📅 Agendar una cita de servicio técnico\n💰 Cotizaciones de productos y servicios\n\n¿En qué le puedo colaborar?',
	GOODBYE:
		'¡Fue un gusto atenderle! 😊 Recuerde que estamos aquí siempre que nos necesite. ¡Que tenga un excelente día!',

	// Fallback & Escalation
	FALLBACK:
		'Disculpe, no logré entender bien su consulta. ¿Podría escribirlo de otra forma?\n\nTambién puede elegir una de estas opciones:\n📋 Información del negocio\n📅 Agendar una cita\n💰 Solicitar una cotización\n\nO simplemente escriba "ayuda" para ver todo lo que puedo hacer por usted.',
	FALLBACK_RETRY:
		'Lamento no poder ayudarle con eso. ¿Le gustaría que lo comunique con uno de nuestros asesores para atenderlo personalmente?',
	ESCALATE:
		'Por supuesto, voy a comunicarlo con uno de nuestros asesores. En un momento lo atenderán. 🙌',

	// FAQ
	HORARIOS: `📅 ¡Con gusto! Nuestros horarios de atención son:

🔹 Lunes a Viernes: 9:00 AM - 6:00 PM
🔹 Sábados: 9:00 AM - 1:00 PM
🔹 Domingos y feriados: Cerrado

Lo esperamos cuando guste. ¿Puedo ayudarle con algo más?`,

	UBICACION: `📍 ¡Claro! Estamos ubicados en:

${process.env.COMPANY_ADDRESS || 'Consulte nuestra dirección en redes sociales'}
Paita, Piura, Perú

📌 Referencia: A la altura de la plataforma deportiva del barrio 'La Molina'
🗺️ Google Maps: https://maps.app.goo.gl/CeruFJv9Pm2ihVNG8

Lo esperamos con gusto. ¿Desea agendar una visita o tiene alguna otra consulta?`,

	CONTACTO: `📞 ¡Por supuesto! Puede comunicarse con nosotros por cualquiera de estos medios:

🔹 Teléfono: ${process.env.COMPANY_PHONE || 'Próximamente'}
🔹 WhatsApp: https://wa.me/${(process.env.COMPANY_WHATSAPP || '').replace(/\+/g, '')}
🔹 Correo: ${process.env.COMPANY_EMAIL || 'Próximamente'}

Estaremos encantados de atenderle. ¿Hay algo más en lo que pueda ayudarle?`,

	REDES_SOCIALES: `📱 ¡Claro que sí! Síganos en nuestras redes sociales para enterarse de las últimas novedades y promociones:

🔵 Facebook: ${process.env.COMPANY_FACEBOOK || 'Próximamente'}
📸 Instagram: ${process.env.COMPANY_INSTAGRAM || 'Próximamente'}

¡Nos encantaría tenerlo como parte de nuestra comunidad! ¿Le puedo ayudar con algo más?`,

	// Appointments
	APPOINTMENT_TYPE_ASK:
		'¡Claro que sí! Con mucho gusto le ayudo a programar su cita. 🔧\n\nCuénteme, ¿cómo le resulta más cómodo?\n\n1️⃣ Traer su equipo a nuestro local\n2️⃣ Que pasemos a recogerlo a su domicilio',
	APPOINTMENT_DATE_ASK: '📅 ¿Qué fecha le vendría bien para su cita?',
	APPOINTMENT_TIME_ASK: '🕐 ¿A qué hora le resultaría más conveniente?',
	APPOINTMENT_CONFIRMED: '✅ ¡Excelente! Su cita ha quedado registrada con éxito.',
	APPOINTMENT_ERROR:
		'Lamentamos mucho el inconveniente, hubo un problema al registrar su cita. 😔 ¿Desea que lo intentemos nuevamente? También puede contactarnos directamente y con gusto le atendemos.',
	APPOINTMENT_SLOT_UNAVAILABLE:
		'Lamentablemente ese horario acaba de ser ocupado. ¿Le gustaría que veamos otra opción disponible?',
	APPOINTMENT_OUT_OF_HOURS:
		'Ese horario queda fuera de nuestro horario de atención. ¿Le gustaría elegir un horario dentro de nuestro rango disponible?',
	APPOINTMENT_CANCELLED:
		'Su cita ha sido cancelada sin problema. ¿Hay algo más en lo que pueda colaborarle?',

	// Quotes
	QUOTE_TYPE_ASK: '¡Con gusto! ¿Qué le gustaría cotizar: un producto o un servicio?',
	QUOTE_PRODUCT_CATEGORY:
		'¿Qué tipo de producto le interesa? Le cuento las opciones:\n\n• Computadora de escritorio\n• Laptop\n• Impresora\n• Accesorios\n• Componentes',
	QUOTE_READY:
		'📋 ¡Su cotización está lista! ¿Por dónde le gustaría recibirla: este medio o correo electrónico?',
	QUOTE_SENT:
		'✅ ¡Cotización enviada con éxito! Tiene una validez de 7 días. No dude en contactarnos si tiene alguna pregunta.',
	QUOTE_NO_PRODUCTS:
		'Lamentablemente no tenemos productos disponibles en esa categoría por el momento. ¿Desea consultar otra categoría o necesita ayuda con algo más?',
	QUOTE_NO_PARTS:
		'No encontramos repuestos compatibles en nuestro inventario. ¿Desea que generemos un requerimiento para buscarlo? También puede agendar una cita y lo revisamos en persona.',
	QUOTE_NO_SERVICES:
		'No encontramos servicios disponibles para ese tipo de equipo. ¿Le gustaría consultar por otro equipo?',
	QUOTE_ASK_LAPTOP_MODEL:
		'¿Cuál es el modelo de su laptop? (Ejemplo: HP Pavilion 15, Dell Inspiron 14, Lenovo IdeaPad 3)',
	QUOTE_ASK_ADD_MORE:
		'¿Desea agregar algo más a su cotización o procedemos con sus datos?\nResponda *Sí* para agregar más o *No* para continuar.',
	QUOTE_ASK_CLIENT_NAME:
		'Para generar su cotización necesito algunos datos. ¿Cuál es su nombre completo?\n(Ejemplo: Juan Pérez López)',
	QUOTE_ASK_CLIENT_PHONE: 'Gracias. ¿Su número de teléfono?\n(9 dígitos, ejemplo: 987654321)',
	QUOTE_ERROR:
		'Disculpe, hubo un problema al generar su cotización. ¿Podría intentarlo nuevamente?',
	QUOTE_CANCELLED: 'Cotización cancelada. ¿Hay algo más en lo que pueda ayudarle?',
	QUOTE_ITEM_ADDED: 'He agregado el producto a su cotización.',
	QUOTE_ASK_EQUIPMENT_TYPE:
		'¿Para qué tipo de equipo necesita el servicio?\n\n1️⃣ PC (escritorio)\n2️⃣ Laptop\n3️⃣ Impresora\n4️⃣ Cámara de seguridad\n\nIndique el número o escriba el tipo de equipo.',

	// Human agent escalation
	DERIVAR_AGENTE: `Entiendo, con gusto lo comunicamos con uno de nuestros asesores. 👤

Puede contactarnos directamente por:
📞 Teléfono: ${process.env.COMPANY_PHONE || 'Próximamente'}
💬 WhatsApp: https://wa.me/${(process.env.COMPANY_WHATSAPP || '').replace(/\+/g, '')}

🕐 Horario de atención:
Lunes a Viernes: 9:00 AM - 6:00 PM
Sábados: 9:00 AM - 1:00 PM

Lamentamos no haber podido resolver su consulta automáticamente. ¡Nuestro equipo estará encantado de atenderle!`,

	DERIVAR_AGENTE_CON_FLUJO: `Entiendo. Voy a cancelar el proceso actual y comunicarlo con un asesor. 👤

Puede contactarnos directamente por:
📞 Teléfono: ${process.env.COMPANY_PHONE || 'Próximamente'}
💬 WhatsApp: https://wa.me/${(process.env.COMPANY_WHATSAPP || '').replace(/\+/g, '')}

🕐 Horario de atención:
Lunes a Viernes: 9:00 AM - 6:00 PM
Sábados: 9:00 AM - 1:00 PM

No se preocupe, cuando vuelva a contactarnos podremos retomar su solicitud.`,

	// Errors
	GENERIC_ERROR:
		'Disculpe, algo no salió como esperábamos. ¿Podría intentarlo una vez más? Si el problema persiste, no dude en contactarnos directamente.',
	EXTERNAL_SERVICE_ERROR:
		'Estamos experimentando algunas dificultades técnicas en este momento. ¿Nos permite contactarlo más tarde para darle seguimiento?',

	// Validation
	INVALID_PHONE:
		'Hmm, ese número no parece estar completo. ¿Podría ingresarlo nuevamente? Debe tener 9 dígitos (ejemplo: 987654321).',
	INVALID_EMAIL:
		'Ese correo no parece estar bien escrito. ¿Podría verificarlo e ingresarlo nuevamente?',
	INVALID_DATE:
		'Esa fecha no está disponible o ya pasó. ¿Podría elegir una fecha a partir de mañana?',
};

const BUSINESS_HOURS = {
	weekday: {
		open: '09:00',
		close: '18:00',
		label: 'Lunes a Viernes',
	},
	saturday: {
		open: '09:00',
		close: '13:00',
		label: 'Sábados',
	},
	sunday: {
		open: null,
		close: null,
		label: 'Domingos y feriados',
	},
};

const CONFIG = {
	SESSION_TIMEOUT_MINUTES: parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 30,
	MAX_BOOKING_DAYS: parseInt(process.env.MAX_BOOKING_DAYS) || 7,
	QUOTE_VALIDITY_DAYS: parseInt(process.env.QUOTE_VALIDITY_DAYS) || 7,
	IGV_PERCENTAGE: parseFloat(process.env.IGV_PERCENTAGE) || 18,
	PORT: parseInt(process.env.PORT) || 3000,
	MAX_DISPLAY_OPTIONS: parseInt(process.env.MAX_DISPLAY_OPTIONS) || 8,
	MAX_SIMULTANEOUS_APPOINTMENTS: parseInt(process.env.MAX_SIMULTANEOUS_APPOINTMENTS) || 3,
	APPOINTMENT_SLOT_DURATION_MINUTES: parseInt(process.env.APPOINTMENT_SLOT_DURATION_MINUTES) || 60,
};

const CONTEXT_NAMES = {
	APPOINTMENT: [
		'cita_seleccion_tipo',
		'cita_local_en_curso',
		'cita_local_confirmar',
		'cita_domicilio_en_curso',
		'cita_domicilio_confirmar',
		'cita_domicilio_paso_equipo',
		'cita_domicilio_paso_problema',
		'cita_domicilio_paso_nombre',
		'cita_domicilio_paso_telefono',
		'cita_domicilio_paso_direccion',
		'cita_domicilio_paso_fecha',
		'cita_domicilio_paso_horario',
	],
	QUOTE: [
		'cotizacion_tipo',
		'cotizacion_producto',
		'cotizacion_servicio',
		'cotizar_computadora_en_curso',
		'cotizar_computadora_opciones',
		'cotizar_repuesto_en_curso',
		'cotizacion_items',
		'cotizacion_confirmar',
	],
};

module.exports = {
	MESSAGES,
	BUSINESS_HOURS,
	CONFIG,
	CONTEXT_NAMES,
};
