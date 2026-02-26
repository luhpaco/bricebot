const { formatDate, formatTime, getRelativeDateLabel } = require('./dateHelpers');

/**
 * Formats appointment summary for confirmation
 * @param {Object} appointmentData - Appointment data
 * @returns {string} Formatted summary
 */
function formatAppointmentSummary(appointmentData) {
	const {
		clientName,
		phone,
		equipmentType,
		problemDescription,
		scheduledDate,
		scheduledTime,
		appointmentType,
		address,
		addressReference,
	} = appointmentData;

	const dateLabel = getRelativeDateLabel(scheduledDate);
	const formattedDate = formatDate(scheduledDate);
	const formattedTime = formatTime(scheduledTime);

	let summary = `¡Muy bien! Antes de confirmar, le dejo el resumen de su cita para que verifique que todo esté correcto: 📋

👤 Nombre: ${clientName}
📞 Teléfono: ${phone}
💻 Equipo: ${equipmentType}
🔧 Motivo: ${problemDescription}
📅 Fecha: ${dateLabel} (${formattedDate})
🕐 Hora: ${formattedTime}`;

	if (appointmentType === 'local') {
		summary += '\n📍 Lugar: Nuestro local en AA.HH. Marco Jara';
	} else if (appointmentType === 'domicilio') {
		summary += `\n📍 Dirección: ${address}`;
		if (addressReference) {
			summary += `\n📌 Referencia: ${addressReference}`;
		}
		summary += '\n🚗 Modalidad: Servicio a domicilio';
	}

	summary += '\n\n¿Está todo correcto? Responda *Sí* para confirmar o *No* si desea hacer algún cambio.';

	return summary;
}

/**
 * Formats available time slots for display
 * @param {Array<string>} slots - Array of time slots in HH:MM format
 * @returns {string} Formatted slots list
 */
function formatAvailableSlots(slots) {
	if (!slots || slots.length === 0) {
		return 'Lamentablemente no quedan horarios disponibles para esta fecha. ¿Desea intentar con otra?';
	}

	const formattedSlots = slots.map((slot) => {
		const formattedTime = formatTime(slot);
		return `• ${formattedTime}`;
	});

	return `⏰ Estos son los horarios que tenemos disponibles:\n\n${formattedSlots.join('\n')}\n\nEscriba la hora que prefiera (ejemplo: 10 de la mañana, 3 pm).`;
}

/**
 * Formats available dates for display
 * @param {Array<Date>} dates - Array of Date objects
 * @returns {string} Formatted dates list
 */
function formatAvailableDates(dates) {
	if (!dates || dates.length === 0) {
		return 'Lamentablemente no tenemos fechas disponibles en este momento. ¿Desea que lo contactemos cuando haya disponibilidad?';
	}

	const formattedDates = dates.map((date) => {
		const dateLabel = getRelativeDateLabel(date);
		const formattedDate = formatDate(date);
		return `• ${dateLabel} (${formattedDate})`;
	});

	return `📅 Estas son las fechas disponibles para los próximos días:\n\n${formattedDates.join('\n')}\n\nEscriba la fecha que prefiera (ejemplo: mañana, el lunes, 20 de febrero).`;
}

/**
 * Formats appointment confirmation message
 * @param {Object} appointment - Appointment object from database
 * @returns {string} Confirmation message
 */
function formatAppointmentConfirmation(appointment) {
	const { referenceNumber, clientName, scheduledDate, scheduledTime } =
		appointment;

	const dateLabel = getRelativeDateLabel(scheduledDate);
	const formattedDate = formatDate(scheduledDate);
	const formattedTime = formatTime(scheduledTime);

	return `✅ ¡Excelente, ${clientName}! Su cita ha quedado registrada con éxito. 🎉

📋 Código de cita: ${referenceNumber}
📅 Fecha: ${dateLabel} (${formattedDate})
🕐 Hora: ${formattedTime}

Le enviaremos una confirmación por WhatsApp con todos los detalles. ¡Lo esperamos!

¿Puedo ayudarle con algo más?`;
}

/**
 * Formats WhatsApp confirmation message
 * @param {Object} appointment - Appointment object
 * @returns {string} WhatsApp message
 */
function formatWhatsAppConfirmation(appointment) {
	const {
		referenceNumber,
		clientName,
		equipmentType,
		problemDescription,
		scheduledDate,
		scheduledTime,
		appointmentType,
		address,
	} = appointment;

	const formattedDate = formatDate(scheduledDate);
	const formattedTime = formatTime(scheduledTime);

	let message = `✅ *CONFIRMACIÓN DE CITA - CBRICENHO*

Código: *${referenceNumber}*
Cliente: ${clientName}
Equipo: ${equipmentType}
Problema: ${problemDescription}
Fecha: ${formattedDate}
Hora: ${formattedTime}`;

	if (appointmentType === 'local') {
		message += '\nUbicación: *Nuestro local* en AA.HH. Marco Jara Schennone Mz D Lote 36';
	} else {
		message += `\nTipo: *Servicio a domicilio*\nDirección: ${address}`;
	}

	message += '\n\n¡Gracias por confiar en CBRICENHO! Lo esperamos con gusto. 🔧';

	return message;
}

/**
 * Formats error message for unavailable slot
 * @param {Date} date - Date that was requested
 * @param {string} time - Time that was requested
 * @returns {string} Error message
 */
function formatUnavailableSlot(date, time) {
	const formattedTime = formatTime(time);
	return `Lamentablemente el horario de las ${formattedTime} acaba de ser ocupado. ¿Le gustaría ver otras opciones disponibles?`;
}

/**
 * Formats list of equipment types
 * @returns {string} Equipment types list
 */
function formatEquipmentTypes() {
	return `Para empezar, cuénteme ¿qué tipo de equipo necesita atención?

• PC (Computadora de escritorio)
• Laptop
• Impresora
• Cámara de seguridad
• Monitor
• Otro

Escriba el tipo de equipo.`;
}

/**
 * Formats range time options for home service
 * @returns {string} Range options
 */
function formatTimeRanges() {
	return `¡Bien! ¿En qué momento del día le resulta más cómodo que pasemos?

1️⃣ Por la mañana (8:00 AM - 12:00 PM)
2️⃣ Por la tarde (2:00 PM - 6:00 PM)`;
}

/**
 * Formats product options for display
 * @param {Array} products - Array of product documents
 * @returns {string} Formatted product options
 */
function formatProductOptions(products) {
	if (!products || products.length === 0) {
		return 'Lamentablemente no tenemos productos disponibles en esa categoría por el momento. ¿Le gustaría ver otra opción?';
	}

	const options = products.map((product, index) => {
		const specs = product.specifications || {};
		let specLine = '';

		if (specs.processor) specLine += specs.processor;
		if (specs.ram) specLine += ` | ${specs.ram}`;
		if (specs.storage) specLine += ` | ${specs.storage}`;
		if (specs.gpu) specLine += ` | ${specs.gpu}`;

		return `${index + 1}️⃣ *${product.name}*\n   ${specLine}\n   💰 S/ ${product.price.toFixed(2)}`;
	});

	return `Estas son las opciones que tenemos disponibles:\n\n${options.join('\n\n')}\n\n¿Cuál le interesa? Puede indicarme el número.`;
}

/**
 * Formats laptop part options for display
 * @param {Array} parts - Array of part product documents
 * @param {number} installationPrice - Installation service price
 * @returns {string} Formatted part options
 */
function formatPartOptions(parts, installationPrice) {
	if (!parts || parts.length === 0) {
		return 'No encontramos repuestos compatibles en nuestro inventario. ¿Desea que generemos un requerimiento para buscarlo? También puede agendar una cita y lo revisamos en persona.';
	}

	const options = parts.map((part, index) => {
		let line = `${index + 1}️⃣ *${part.name}*\n   ${part.description}`;
		line += `\n   💰 Repuesto: S/ ${part.price.toFixed(2)}`;

		if (installationPrice > 0) {
			const totalWithInstall = part.price + installationPrice;
			line += `\n   🔧 Con instalación: S/ ${totalWithInstall.toFixed(2)}`;
		}

		return line;
	});

	return `Encontré estas opciones:\n\n${options.join('\n\n')}\n\n¿Cuál le interesa?`;
}

/**
 * Formats service options for display
 * @param {Array} services - Array of service documents
 * @returns {string} Formatted service options
 */
function formatServiceOptions(services) {
	if (!services || services.length === 0) {
		return 'No encontramos servicios disponibles para ese tipo de equipo. ¿Le gustaría consultar por otro equipo?';
	}

	const options = services.map((service, index) => {
		return `${index + 1}️⃣ *${service.name}*\n   ${service.description}\n   💰 Desde S/ ${service.basePrice.toFixed(2)}\n   ⏱️ Duración estimada: ${service.estimatedDuration}`;
	});

	return `Estos son los servicios que ofrecemos:\n\n${options.join('\n\n')}\n\n¿Cuál le interesa?`;
}

/**
 * Formats quote summary for confirmation
 * @param {Object} quoteData - Quote data
 * @returns {string} Formatted quote summary
 */
function formatQuoteSummary(quoteData) {
	const { clientName, phone, items, subtotal, igv, totalAmount } = quoteData;

	const itemLines = items.map((item) => {
		const lineTotal = item.unitPrice * item.quantity;
		return `│ ${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}\n│ S/ ${lineTotal.toFixed(2)}`;
	});

	return `Aquí tiene el resumen de su cotización: 📋

👤 Cliente: ${clientName}
📞 Teléfono: ${phone}

┌──────────────────────────────────┐
${itemLines.join('\n├──────────────────────────────────┤\n')}
├──────────────────────────────────┤
│ Subtotal:        S/ ${subtotal.toFixed(2)}
│ IGV (18%):       S/ ${igv.toFixed(2)}
│ *TOTAL:          S/ ${totalAmount.toFixed(2)}*
└──────────────────────────────────┘
📅 Validez: 7 días

¿Confirma la cotización? Responda *Sí* para generar o *No* si desea hacer cambios.`;
}

/**
 * Formats quote confirmation message
 * @param {Object} quote - Quote document from database
 * @returns {string} Confirmation message
 */
function formatQuoteConfirmation(quote) {
	return `✅ ¡Cotización generada exitosamente! 🎉

📋 Código: ${quote.quoteNumber}
💰 Total: S/ ${quote.totalAmount.toFixed(2)}
📅 Válida hasta: ${formatDate(quote.validUntil)}

Le enviaremos los detalles completos por WhatsApp.

¿Puedo ayudarle con algo más?`;
}

/**
 * Formats a full quote for WhatsApp delivery
 * @param {Object} quote - Quote document from database
 * @returns {string} WhatsApp-formatted quote
 */
function formatWhatsAppQuote(quote) {
	const itemLines = quote.items.map((item, index) => {
		const lineTotal = item.unitPrice * item.quantity;
		return `${index + 1}. ${item.name} x${item.quantity} - S/ ${lineTotal.toFixed(2)}`;
	});

	let message = `📋 *COTIZACIÓN - CBRICENHO E.I.R.L*
RUC: 20606300825

Código: *${quote.quoteNumber}*
Fecha: ${formatDate(new Date())}

Cliente: ${quote.clientName}
Teléfono: ${quote.phone}

*DETALLE:*
${itemLines.join('\n')}

─────────────────────
Subtotal: S/ ${quote.subtotal.toFixed(2)}
IGV (18%): S/ ${quote.igv.toFixed(2)}
*TOTAL: S/ ${quote.totalAmount.toFixed(2)}*
─────────────────────

📅 Válida hasta: ${formatDate(quote.validUntil)}

_Cotización generada automáticamente._
_Precios sujetos a disponibilidad de stock._

¡Gracias por su preferencia! 🔧`;

	return message;
}

/**
 * Formats product category options
 * @returns {string} Category options
 */
function formatProductCategories() {
	return `¿Qué tipo de producto le interesa?

1️⃣ Computadora de escritorio
2️⃣ Repuestos de laptop
3️⃣ Impresora
4️⃣ Accesorios y componentes`;
}

/**
 * Formats computer use case options
 * @returns {string} Use case options
 */
function formatComputerUseCases() {
	return `¡Excelente elección! 🖥️ ¿Para qué uso principal será la computadora?

1️⃣ Ofimática (oficina, documentos, navegación)
2️⃣ Diseño gráfico (Photoshop, Illustrator, edición)
3️⃣ Programación (desarrollo de software)
4️⃣ Gaming (videojuegos)
5️⃣ Estudio (tareas, clases virtuales)`;
}

/**
 * Formats part type options for laptop repair
 * @returns {string} Part type options
 */
function formatPartTypes() {
	return `¿Qué repuesto necesita para su laptop?

• Pantalla / Display
• Teclado
• Batería
• Disco SSD
• Memoria RAM
• Cargador

Escriba el nombre del repuesto que necesita.`;
}

/**
 * Formats quote type options (product vs service)
 * @returns {string} Quote type options
 */
function formatQuoteTypes() {
	return `Con gusto le ayudo con una cotización. 💰\n\n¿Qué desea cotizar?\n\n1️⃣ Productos (computadoras, repuestos, impresoras, etc.)\n2️⃣ Servicios (mantenimiento, reparaciones, instalaciones)`;
}

module.exports = {
	formatAppointmentSummary,
	formatAvailableSlots,
	formatAvailableDates,
	formatAppointmentConfirmation,
	formatWhatsAppConfirmation,
	formatUnavailableSlot,
	formatEquipmentTypes,
	formatTimeRanges,
	formatProductOptions,
	formatPartOptions,
	formatServiceOptions,
	formatQuoteSummary,
	formatQuoteConfirmation,
	formatWhatsAppQuote,
	formatProductCategories,
	formatComputerUseCases,
	formatPartTypes,
	formatQuoteTypes,
};
