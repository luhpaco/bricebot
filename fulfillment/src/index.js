const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
require('dotenv').config();

const dbConnection = require('./config/database');
const { CONFIG } = require('./config/constants');
const MetricsService = require('./services/metrics.service');
const faqHandler = require('./handlers/faq.handler');
const appointmentsHandler = require('./handlers/appointments.handler');
const quotesHandler = require('./handlers/quotes.handler');

/**
 * Detects if a user query contains cancel, goodbye, or escalation keywords
 * that should override the current flow-step intent.
 * @param {string} query - User's raw query text
 * @returns {'cancelar'|'despedida'|'derivar'|null}
 */
function detectOverrideIntent(query) {
	const normalized = query
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');

	if (/\b(cancelar|cancela|quiero cancelar|no quiero continuar|cancelar proceso|cancelar la cita|cancelar la cotizacion)\b/.test(normalized)) {
		return 'cancelar';
	}
	if (/\b(adios|chau|hasta luego|bye|nos vemos|me voy|hasta pronto)\b/.test(normalized)) {
		return 'despedida';
	}
	if (/hablar con (un |una )?(agente|persona|asesor|humano|alguien)/.test(normalized) ||
		/\b(agente humano|persona real|asesor humano)\b/.test(normalized)) {
		return 'derivar';
	}

	return null;
}

const app = express();
const PORT = CONFIG.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
	next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
	const dbStatus = dbConnection.isConnected() ? 'connected' : 'disconnected';
	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		database: dbStatus,
	});
});

/**
 * Main webhook endpoint for Dialogflow
 */
app.post('/webhook', async (req, res) => {
	const startTime = Date.now();

	try {
		const agent = new WebhookClient({ request: req, response: res });

		const sessionId = agent.session;
		const intent = agent.intent;
		const queryText = agent.query;
		const userId =
			req.body.originalDetectIntentRequest?.payload?.userId || 'unknown';

		console.log(`[Webhook] Session: ${sessionId}`);
		console.log(`[Webhook] Intent: ${intent}`);
		console.log(`[Webhook] Query: ${queryText}`);

		// M4: Record user message without blocking intent processing on failure
		try {
			await MetricsService.recordMessage(
				sessionId,
				userId,
				'user',
				queryText,
				intent,
				agent.consoleMessages?.[0]?.confidence || null,
				'messenger',
			);
		} catch (metricsError) {
			console.error('[Webhook] Metrics error (non-fatal):', metricsError.message);
		}

		// M5: Reset fallback counter on any successful intent match
		if (intent !== 'Default Fallback Intent') {
			agent.context.set({ name: 'fallback_count', lifespan: 0, parameters: {} });
		}

		// Override detection: when an active flow absorbs cancel/goodbye/escalation
		// keywords into a free-text handler, redirect to the correct handler.
		const activeFlow = faqHandler.getActiveFlow(agent);
		let intentOverride = null;
		if (activeFlow) {
			intentOverride = detectOverrideIntent(queryText);
		}

		const intentMap = new Map();

		intentMap.set('saludo', faqHandler.handleGreeting);
		intentMap.set('despedida', faqHandler.handleGoodbye);
		intentMap.set('ayuda', faqHandler.handleHelp);
		intentMap.set('Default Fallback Intent', faqHandler.handleFallback);
		intentMap.set('derivar_agente_humano', faqHandler.handleDerivarAgente);
		intentMap.set('cancelar_proceso', faqHandler.handleCancelarProceso);
		intentMap.set('faq_horarios', faqHandler.handleHorarios);
		intentMap.set('faq_ubicacion', faqHandler.handleUbicacion);
		intentMap.set('faq_contacto', faqHandler.handleContacto);
		intentMap.set('faq_redes_sociales', faqHandler.handleRedesSociales);

		intentMap.set('cita_iniciar', appointmentsHandler.handleAppointmentInitiate);
		intentMap.set('cita_local_iniciar', appointmentsHandler.handleLocalAppointmentStart);
		intentMap.set('cita_local_equipo', appointmentsHandler.handleLocalEquipmentType);
		intentMap.set('cita_local_problema', appointmentsHandler.handleLocalProblemDescription);
		intentMap.set('cita_local_nombre', appointmentsHandler.handleLocalClientName);
		intentMap.set('cita_local_telefono', appointmentsHandler.handleLocalClientPhone);
		intentMap.set('cita_local_fecha', appointmentsHandler.handleLocalDateSelection);
		intentMap.set('cita_local_hora', appointmentsHandler.handleLocalTimeSelection);
		intentMap.set('cita_local_confirmar_si', appointmentsHandler.handleLocalConfirmYes);
		intentMap.set('cita_local_confirmar_no', appointmentsHandler.handleLocalConfirmNo);

		intentMap.set('cita_domicilio_iniciar', appointmentsHandler.handleHomeAppointmentStart);
		intentMap.set('cita_domicilio_equipo', appointmentsHandler.handleHomeEquipmentType);
		intentMap.set('cita_domicilio_problema', appointmentsHandler.handleHomeProblemDescription);
		intentMap.set('cita_domicilio_nombre', appointmentsHandler.handleHomeClientName);
		intentMap.set('cita_domicilio_telefono', appointmentsHandler.handleHomeClientPhone);
		intentMap.set('cita_domicilio_direccion', appointmentsHandler.handleHomeAddress);
		intentMap.set('cita_domicilio_fecha', appointmentsHandler.handleHomeDateSelection);
		intentMap.set('cita_domicilio_rango_horario', appointmentsHandler.handleHomeTimeRange);
		intentMap.set('cita_domicilio_confirmar_si', appointmentsHandler.handleHomeConfirmYes);
		intentMap.set('cita_domicilio_confirmar_no', appointmentsHandler.handleHomeConfirmNo);

		intentMap.set('cotizar_iniciar', quotesHandler.handleQuoteInitiate);
		intentMap.set('cotizar_producto_categoria', quotesHandler.handleQuoteProductCategory);
		intentMap.set('cotizar_servicio_tipo', quotesHandler.handleQuoteServiceType);
		intentMap.set('cotizar_servicio_equipo', quotesHandler.handleQuoteServiceEquipment);
		intentMap.set('cotizar_servicio_seleccionar', quotesHandler.handleQuoteServiceSelect);
		intentMap.set('cotizar_producto_generico', quotesHandler.handleQuoteGenericProduct);
		intentMap.set('cotizar_computadora', quotesHandler.handleQuoteComputer);
		intentMap.set('cotizar_computadora_uso', quotesHandler.handleQuoteComputerUse);
		intentMap.set('cotizar_computadora_seleccionar', quotesHandler.handleQuoteComputerSelect);
		intentMap.set('cotizar_repuesto_laptop', quotesHandler.handleQuoteLaptopPart);
		intentMap.set('cotizar_repuesto_seleccionar', quotesHandler.handleQuotePartSelect);
		intentMap.set('cotizar_agregar_mas', quotesHandler.handleQuoteAddMore);
		intentMap.set('cotizar_datos_cliente', quotesHandler.handleQuoteClientData);
		intentMap.set('cotizar_confirmar_si', quotesHandler.handleQuoteConfirmYes);
		intentMap.set('cotizar_confirmar_no', quotesHandler.handleQuoteConfirmNo);

		// Apply override: replace the misrouted intent's handler with the correct one
		const NON_OVERRIDABLE = ['saludo', 'despedida', 'ayuda', 'Default Fallback Intent',
			'derivar_agente_humano', 'cancelar_proceso', 'faq_horarios', 'faq_ubicacion',
			'faq_contacto', 'faq_redes_sociales'];
		if (intentOverride && !NON_OVERRIDABLE.includes(intent)) {
			if (intentOverride === 'cancelar') {
				console.log(`[Webhook] Override: ${intent} → cancelar_proceso`);
				intentMap.set(intent, faqHandler.handleCancelarProceso);
			} else if (intentOverride === 'despedida') {
				console.log(`[Webhook] Override: ${intent} → despedida`);
				intentMap.set(intent, faqHandler.handleGoodbye);
			} else if (intentOverride === 'derivar') {
				console.log(`[Webhook] Override: ${intent} → derivar_agente_humano`);
				intentMap.set(intent, faqHandler.handleDerivarAgente);
			}
		}

		await agent.handleRequest(intentMap);

		const endTime = Date.now();
		const responseDurationMs = endTime - startTime;

		// M4: Record bot response without blocking on failure
		const responseText =
			agent.consoleMessages?.[0]?.text?.text?.[0] || 'Respuesta procesada';
		try {
			await MetricsService.recordMessage(
				sessionId,
				userId,
				'bot',
				responseText,
				intent,
				null,
				'messenger',
				responseDurationMs,
			);
		} catch (metricsError) {
			console.error('[Webhook] Metrics error (non-fatal):', metricsError.message);
		}
		await MetricsService.recordInteraction({
			sessionId,
			userId,
			intent,
			startTime,
			endTime,
			success: true,
		});

		console.log(`[Webhook] Response sent in ${endTime - startTime}ms`);
	} catch (error) {
		console.error('[Webhook] Error processing request:', error);

		try {
			const endTime = Date.now();
			await MetricsService.recordInteraction({
				sessionId: req.body.session || 'unknown',
				userId: 'unknown',
				intent: req.body.queryResult?.intent?.displayName || 'unknown',
				startTime,
				endTime,
				success: false,
				error: error.message,
			});
		} catch (metricsError) {
			console.error('[Webhook] Metrics error in catch block (non-fatal):', metricsError.message);
		}

		res.status(500).json({
			fulfillmentText:
				'Lo sentimos, ocurrió un error. Por favor, intente nuevamente.',
		});
	}
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
	res.json({
		name: 'CBRICENHO Chatbot',
		version: '1.0.0',
		status: 'running',
		endpoints: {
			health: '/health',
			webhook: '/webhook (POST)',
		},
	});
});

/**
 * 404 handler
 */
app.use((req, res) => {
	res.status(404).json({
		error: 'Not Found',
		message: 'The requested endpoint does not exist',
	});
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
	console.error('[Express] Error:', err);
	res.status(500).json({
		error: 'Internal Server Error',
		message: err.message,
	});
});

/**
 * Start server
 */
async function startServer() {
	try {
		await dbConnection.connect();
		console.log('[Server] Database connected successfully');

		app.listen(PORT, () => {
			console.log(`[Server] CBRICENHO Chatbot running on port ${PORT}`);
			console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
			console.log(`[Server] Webhook URL: http://localhost:${PORT}/webhook`);
			console.log(`[Server] Health check: http://localhost:${PORT}/health`);
		});
	} catch (error) {
		console.error('[Server] Failed to start:', error);
		process.exit(1);
	}
}

process.on('SIGINT', async () => {
	console.log('\n[Server] Shutting down gracefully...');
	await dbConnection.disconnect();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	console.log('\n[Server] Shutting down gracefully...');
	await dbConnection.disconnect();
	process.exit(0);
});

startServer();
