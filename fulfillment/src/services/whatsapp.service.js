const { formatWhatsAppConfirmation } = require('../utils/formatters');

/**
 * WhatsApp Service - Placeholder/Simulator
 * This service simulates WhatsApp message sending.
 * In production, this should be replaced with actual WhatsApp Business API integration.
 */
class WhatsAppService {
	/**
	 * Sends appointment confirmation via WhatsApp (simulated)
	 * @param {string} phone - Phone number to send to
	 * @param {Object} appointmentData - Appointment data
	 * @returns {Promise<Object>} Result object
	 */
	async sendAppointmentConfirmation(phone, appointmentData) {
		const message = formatWhatsAppConfirmation(appointmentData);

		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('[WhatsAppService] SIMULATED WhatsApp Message');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log(`To: ${phone}`);
		console.log(`\n${message}`);
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

		return {
			success: true,
			simulated: true,
			phone: phone,
			message: message,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Sends a reminder via WhatsApp (simulated)
	 * @param {string} phone - Phone number
	 * @param {Object} appointmentData - Appointment data
	 * @returns {Promise<Object>} Result object
	 */
	async sendReminder(phone, appointmentData) {
		const {
			referenceNumber,
			clientName,
			scheduledDate,
			scheduledTime,
		} = appointmentData;

		const message = `🔔 *RECORDATORIO DE CITA - CBRICENHO*

Hola ${clientName},

Le recordamos su cita programada:

Código: ${referenceNumber}
Fecha: ${scheduledDate.toLocaleDateString('es-PE')}
Hora: ${scheduledTime}

¡Nos vemos pronto! 🔧

_Este es un mensaje automático_`;

		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('[WhatsAppService] SIMULATED WhatsApp Reminder');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log(`To: ${phone}`);
		console.log(`\n${message}`);
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

		return {
			success: true,
			simulated: true,
			phone: phone,
			message: message,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Sends cancellation notification via WhatsApp (simulated)
	 * @param {string} phone - Phone number
	 * @param {Object} appointmentData - Appointment data
	 * @returns {Promise<Object>} Result object
	 */
	async sendCancellation(phone, appointmentData) {
		const { referenceNumber, clientName } = appointmentData;

		const message = `❌ *CITA CANCELADA - CBRICENHO*

Hola ${clientName},

Su cita con código ${referenceNumber} ha sido cancelada exitosamente.

Si desea reagendar, puede contactarnos nuevamente.

Gracias por su comprensión.

_Este es un mensaje automático_`;

		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('[WhatsAppService] SIMULATED WhatsApp Cancellation');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log(`To: ${phone}`);
		console.log(`\n${message}`);
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

		return {
			success: true,
			simulated: true,
			phone: phone,
			message: message,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Sends a quote via WhatsApp (simulated)
	 * @param {string} phone - Phone number to send to
	 * @param {Object} quote - Quote document from database
	 * @returns {Promise<Object>} Result object
	 */
	async sendQuote(phone, quote) {
		const { formatWhatsAppQuote } = require('../utils/formatters');
		const message = formatWhatsAppQuote(quote);

		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('[WhatsAppService] SIMULATED WhatsApp Quote');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log(`To: ${phone}`);
		console.log(`\n${message}`);
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

		return {
			success: true,
			simulated: true,
			phone: phone,
			message: message,
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Checks if WhatsApp integration is active (always false for placeholder)
	 * @returns {boolean} Always false for placeholder
	 */
	isActive() {
		return false;
	}

	/**
	 * Gets integration status
	 * @returns {Object} Status object
	 */
	getStatus() {
		return {
			active: false,
			mode: 'simulation',
			message:
				'WhatsApp integration is in simulation mode. Messages are logged but not actually sent.',
		};
	}
}

const whatsappService = new WhatsAppService();

module.exports = whatsappService;
