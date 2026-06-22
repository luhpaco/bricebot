const Conversation = require('../models/Conversation');
const MetricsService = require('../services/metrics.service');
const { MESSAGES, CONTEXT_NAMES } = require('../config/constants');

/**
 * Detects whether there is an active multi-turn flow in progress.
 * Returns the flow name or null if no active flow is found.
 * @param {Object} agent - Dialogflow WebhookClient agent
 * @returns {string|null} 'cita_local' | 'cita_domicilio' | 'cotizacion' | null
 */
function getActiveFlow(agent) {
	const isActive = (name) => {
		const ctx = agent.context.get(name);
		return ctx && ctx.lifespan > 0;
	};

	if (isActive('cita_seleccion_tipo')) {
		return 'cita';
	}
	if (isActive('cita_local_en_curso') || isActive('cita_local_confirmar')) {
		return 'cita_local';
	}
	if (isActive('cita_domicilio_en_curso') || isActive('cita_domicilio_confirmar')) {
		return 'cita_domicilio';
	}
	if (
		isActive('cotizacion_tipo') ||
		isActive('cotizacion_producto') ||
		isActive('cotizacion_items') ||
		isActive('cotizacion_confirmar') ||
		isActive('cotizar_computadora_en_curso') ||
		isActive('cotizar_repuesto_en_curso') ||
		isActive('cotizacion_servicio')
	) {
		return 'cotizacion';
	}
	return null;
}

/**
 * Handles the greeting intent. If a flow is active, acknowledges it instead
 * of showing the full welcome to avoid disorienting the user.
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleGreeting = (agent) => {
	const activeFlow = getActiveFlow(agent);

	if (activeFlow === 'cita' || activeFlow === 'cita_local' || activeFlow === 'cita_domicilio') {
		agent.add(
			'¡Hola nuevamente! 👋 Veo que tiene una cita en proceso. ¿Desea continuar con el registro?\nResponda *Sí* para continuar o *No* para cancelar.'
		);
		return;
	}
	if (activeFlow === 'cotizacion') {
		agent.add(
			'¡Hola nuevamente! 👋 Veo que tiene una cotización en proceso. ¿Desea continuar con la cotización?\nResponda *Sí* para continuar o *No* para cancelar.'
		);
		return;
	}

	agent.add(MESSAGES.WELCOME);
};

/**
 * Handles the goodbye intent. If a flow is active, warns the user that
 * their progress will be lost.
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleGoodbye = async (agent) => {
	const activeFlow = getActiveFlow(agent);

	// Clear any active flow contexts so the next session starts fresh
	if (activeFlow) {
		[...CONTEXT_NAMES.APPOINTMENT, ...CONTEXT_NAMES.QUOTE].forEach((name) => {
			agent.context.set({ name, lifespan: 0, parameters: {} });
		});
	}
	agent.context.set({ name: 'fallback_count', lifespan: 0, parameters: {} });

	// Mark conversation as ended for metrics
	try {
		await MetricsService.endConversation(agent.session);
	} catch (err) {
		console.error('[FAQ] Error ending conversation (non-fatal):', err.message);
	}

	agent.add(MESSAGES.GOODBYE);
};

/**
 * Handles the help intent
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHelp = (agent) => {
	const helpMessage = `¡Por supuesto, estoy aquí para ayudarle! 😊

Estas son las cosas que puedo hacer por usted:

📋 *Información* — Pregúnteme sobre horarios, ubicación, contacto o redes sociales
📅 *Agendar una cita* — Puedo programar servicio técnico en nuestro local o a domicilio
💰 *Cotizaciones* — Consulte precios de computadoras, repuestos y servicios técnicos

Solo dígame qué necesita, con confianza. También puede escribir palabras clave como "horarios", "cita" o "cotización".`;

	agent.add(helpMessage);
};

/**
 * Marks escalatedToHuman = true in the conversation document for metrics.
 * Non-fatal: logs error but does not throw.
 * @param {string} sessionId - Dialogflow session identifier
 * @param {string} source - Log label identifying the escalation trigger
 * @returns {Promise<void>}
 */
async function markEscalatedToHuman(sessionId, source) {
	try {
		const conversation = await Conversation.findOne({ sessionId });
		if (conversation) {
			conversation.escalatedToHuman = true;
			await conversation.save();
		}
	} catch (err) {
		console.error(`[${source}] Metrics escalation update failed:`, err.message);
	}
}

/**
 * Handles the fallback intent with progressive escalation.
 * Uses a fallback_count context to track consecutive unrecognized messages:
 * - 1st attempt: standard fallback message
 * - 2nd attempt: offer quick options
 * - 3rd+ attempt: escalate to human agent and record in metrics
 * @param {Object} agent - Dialogflow WebhookClient agent
 * @returns {Promise<void>}
 */
const handleFallback = async (agent) => {
	const countContext = agent.context.get('fallback_count');
	const count = countContext?.parameters?.count || 0;
	const newCount = count + 1;

	if (newCount >= 3) {
		agent.context.set({ name: 'fallback_count', lifespan: 0, parameters: {} });
		await markEscalatedToHuman(agent.session, 'Fallback');
		agent.add(MESSAGES.ESCALATE);
		return;
	}

	agent.context.set({
		name: 'fallback_count',
		lifespan: 5,
		parameters: { count: newCount },
	});

	if (newCount === 2) {
		agent.add(MESSAGES.FALLBACK_RETRY);
	} else {
		agent.add(MESSAGES.FALLBACK);
	}
};

/**
 * Handles the derivar_agente_humano intent.
 * Clears any active flow contexts, resets the fallback counter,
 * records the escalation in metrics, and responds with contact details.
 * @param {Object} agent - Dialogflow WebhookClient agent
 * @returns {Promise<void>}
 */
const handleDerivarAgente = async (agent) => {
	const activeFlow = getActiveFlow(agent);

	if (activeFlow) {
		[...CONTEXT_NAMES.APPOINTMENT, ...CONTEXT_NAMES.QUOTE].forEach((name) => {
			agent.context.set({ name, lifespan: 0, parameters: {} });
		});
	}

	agent.context.set({ name: 'fallback_count', lifespan: 0, parameters: {} });

	await markEscalatedToHuman(agent.session, 'DerivarAgente');

	// End conversation in metrics -- escalation is a conversation closure
	try {
		await MetricsService.endConversation(agent.session);
	} catch (err) {
		console.error('[FAQ] Error ending conversation (non-fatal):', err.message);
	}

	agent.add(activeFlow ? MESSAGES.DERIVAR_AGENTE_CON_FLUJO : MESSAGES.DERIVAR_AGENTE);
};

/**
 * Handles the business hours inquiry
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleHorarios = (agent) => {
	agent.add(MESSAGES.HORARIOS);
};

/**
 * Handles the location inquiry
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleUbicacion = (agent) => {
	agent.add(MESSAGES.UBICACION);
};

/**
 * Handles the contact information inquiry
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleContacto = (agent) => {
	agent.add(MESSAGES.CONTACTO);
};

/**
 * Handles the social media inquiry
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleRedesSociales = (agent) => {
	agent.add(MESSAGES.REDES_SOCIALES);
};

/**
 * Handles mid-flow cancellation. Clears all active flow contexts
 * and returns the user to the main menu.
 * @param {Object} agent - Dialogflow WebhookClient agent
 */
const handleCancelarProceso = (agent) => {
	const activeFlow = getActiveFlow(agent);

	if (!activeFlow) {
		agent.add('No tiene ningún proceso activo en este momento. ¿En qué le puedo ayudar?');
		return;
	}

	[...CONTEXT_NAMES.APPOINTMENT, ...CONTEXT_NAMES.QUOTE].forEach((name) => {
		agent.context.set({ name, lifespan: 0, parameters: {} });
	});

	const flowNames = {
		cita: 'proceso de cita',
		cita_local: 'cita en nuestro local',
		cita_domicilio: 'cita a domicilio',
		cotizacion: 'cotización',
	};

	const flowName = flowNames[activeFlow] || 'proceso';
	agent.add(
		`He cancelado su ${flowName} sin problema. ¿Puedo ayudarle con algo más?\n\n📅 Agendar una cita\n💰 Solicitar una cotización\n📋 Información del negocio`
	);
};

module.exports = {
	getActiveFlow,
	handleGreeting,
	handleGoodbye,
	handleHelp,
	handleFallback,
	handleDerivarAgente,
	handleCancelarProceso,
	handleHorarios,
	handleUbicacion,
	handleContacto,
	handleRedesSociales,
};
