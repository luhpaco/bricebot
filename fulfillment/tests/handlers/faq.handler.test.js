const { createMockAgent } = require('../helpers/mockAgent');

jest.mock('../../src/models/Conversation', () => ({
	findOne: jest.fn(),
}));

const Conversation = require('../../src/models/Conversation');
const faqHandler = require('../../src/handlers/faq.handler');

describe('faq.handler', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// -------------------------------------------------------------------------
	// getActiveFlow — context branch coverage
	// -------------------------------------------------------------------------
	describe('getActiveFlow', () => {
		it('should return "cita" when cita_seleccion_tipo context is active', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_seleccion_tipo', lifespan: 5, parameters: {} }],
			});
			const flow = faqHandler.getActiveFlow(agent);
			expect(flow).toBe('cita');
		});

		it('should return "cita_local" when cita_local_en_curso is active', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_local_en_curso', lifespan: 5, parameters: {} }],
			});
			expect(faqHandler.getActiveFlow(agent)).toBe('cita_local');
		});

		it('should return "cita_local" when cita_local_confirmar is active', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_local_confirmar', lifespan: 5, parameters: {} }],
			});
			expect(faqHandler.getActiveFlow(agent)).toBe('cita_local');
		});

		it('should return "cita_domicilio" when cita_domicilio_en_curso is active', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_domicilio_en_curso', lifespan: 5, parameters: {} }],
			});
			expect(faqHandler.getActiveFlow(agent)).toBe('cita_domicilio');
		});

		it('should return "cita_domicilio" when cita_domicilio_confirmar is active', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_domicilio_confirmar', lifespan: 5, parameters: {} }],
			});
			expect(faqHandler.getActiveFlow(agent)).toBe('cita_domicilio');
		});

		it('should return "cotizacion" when cotizacion_tipo is active', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cotizacion_tipo', lifespan: 5, parameters: {} }],
			});
			expect(faqHandler.getActiveFlow(agent)).toBe('cotizacion');
		});

		it('should return "cotizacion" when cotizar_computadora_en_curso is active', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cotizar_computadora_en_curso', lifespan: 5, parameters: {} }],
			});
			expect(faqHandler.getActiveFlow(agent)).toBe('cotizacion');
		});

		it('should return "cotizacion" when cotizar_repuesto_en_curso is active', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cotizar_repuesto_en_curso', lifespan: 5, parameters: {} }],
			});
			expect(faqHandler.getActiveFlow(agent)).toBe('cotizacion');
		});

		it('should return "cotizacion" when cotizacion_servicio is active', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cotizacion_servicio', lifespan: 5, parameters: {} }],
			});
			expect(faqHandler.getActiveFlow(agent)).toBe('cotizacion');
		});

		it('should return null when no relevant context is active', () => {
			const agent = createMockAgent();
			expect(faqHandler.getActiveFlow(agent)).toBeNull();
		});
	});

	// -------------------------------------------------------------------------
	// handleGreeting
	// -------------------------------------------------------------------------
	describe('handleGreeting', () => {
		it('should respond with WELCOME when no active flow', () => {
			const agent = createMockAgent();
			faqHandler.handleGreeting(agent);
			expect(agent.add).toHaveBeenCalledTimes(1);
			expect(agent.add.mock.calls[0][0]).toMatch(/CBRICENHO/i);
		});

		it('should acknowledge active cita_local flow', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_local_en_curso', lifespan: 5, parameters: {} }],
			});
			faqHandler.handleGreeting(agent);
			expect(agent.add.mock.calls[0][0]).toMatch(/cita/i);
		});

		it('should acknowledge active cotizacion flow', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cotizacion_items', lifespan: 5, parameters: {} }],
			});
			faqHandler.handleGreeting(agent);
			expect(agent.add.mock.calls[0][0]).toMatch(/cotizaci/i);
		});

		it('should acknowledge cita_seleccion_tipo active flow (cita branch)', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_seleccion_tipo', lifespan: 5, parameters: {} }],
			});
			faqHandler.handleGreeting(agent);
			expect(agent.add).toHaveBeenCalledTimes(1);
			expect(agent.add.mock.calls[0][0]).toMatch(/cita/i);
		});

		it('should acknowledge cita_domicilio_en_curso active flow (cita_domicilio branch)', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_domicilio_en_curso', lifespan: 5, parameters: {} }],
			});
			faqHandler.handleGreeting(agent);
			expect(agent.add).toHaveBeenCalledTimes(1);
			expect(agent.add.mock.calls[0][0]).toMatch(/cita/i);
		});
	});

	// -------------------------------------------------------------------------
	// handleGoodbye
	// -------------------------------------------------------------------------
	describe('handleGoodbye', () => {
		it('should respond with GOODBYE when no active flow', async () => {
			const agent = createMockAgent();
			await faqHandler.handleGoodbye(agent);
			expect(agent.add).toHaveBeenCalledTimes(1);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/gusto|excelente|día/i);
		});

		it('should clear active flow contexts and respond with GOODBYE', async () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_local_en_curso', lifespan: 5, parameters: {} }],
			});
			await faqHandler.handleGoodbye(agent);
			expect(agent.add.mock.calls[0][0]).toMatch(/gusto|excelente|día/i);
			expect(agent.context.set).toHaveBeenCalled();
		});

		it('should still resolve and respond when MetricsService.endConversation throws', async () => {
			// Import the real MetricsService and mock endConversation for this test only
			const MetricsService = require('../../src/services/metrics.service');
			const originalEnd = MetricsService.endConversation;
			MetricsService.endConversation = jest.fn().mockRejectedValueOnce(new Error('DB failure'));

			const agent = createMockAgent();
			await expect(faqHandler.handleGoodbye(agent)).resolves.not.toThrow();
			expect(agent.add).toHaveBeenCalledTimes(1);
			expect(agent.add.mock.calls[0][0]).toMatch(/gusto|excelente|día/i);

			MetricsService.endConversation = originalEnd;
		});
	});

	// -------------------------------------------------------------------------
	// handleHelp
	// -------------------------------------------------------------------------
	describe('handleHelp', () => {
		it('should list available options', () => {
			const agent = createMockAgent();
			faqHandler.handleHelp(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/cita|cotizaci|informaci/i);
		});
	});

	// -------------------------------------------------------------------------
	// handleHorarios
	// -------------------------------------------------------------------------
	describe('handleHorarios', () => {
		it('should respond with business hours', () => {
			const agent = createMockAgent();
			faqHandler.handleHorarios(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/lunes|viernes|sábado/i);
		});
	});

	// -------------------------------------------------------------------------
	// handleUbicacion
	// -------------------------------------------------------------------------
	describe('handleUbicacion', () => {
		it('should respond with location information', () => {
			const agent = createMockAgent();
			faqHandler.handleUbicacion(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/paita|marco jara/i);
		});
	});

	// -------------------------------------------------------------------------
	// handleContacto
	// -------------------------------------------------------------------------
	describe('handleContacto', () => {
		it('should respond with contact information', () => {
			const agent = createMockAgent();
			faqHandler.handleContacto(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/teléfono|whatsapp|correo/i);
		});
	});

	// -------------------------------------------------------------------------
	// handleRedesSociales
	// -------------------------------------------------------------------------
	describe('handleRedesSociales', () => {
		it('should respond with social media links', () => {
			const agent = createMockAgent();
			faqHandler.handleRedesSociales(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/facebook|instagram/i);
		});
	});

	// -------------------------------------------------------------------------
	// handleFallback
	// -------------------------------------------------------------------------
	describe('handleFallback', () => {
		it('should respond with FALLBACK on first unrecognized message', async () => {
			const agent = createMockAgent();
			await faqHandler.handleFallback(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/entender|reformul/i);
		});

		it('should respond with FALLBACK_RETRY on second attempt', async () => {
			const agent = createMockAgent({
				contexts: [{ name: 'fallback_count', lifespan: 5, parameters: { count: 1 } }],
			});
			await faqHandler.handleFallback(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/asesor|personalmente/i);
		});

		it('should escalate and mark escalatedToHuman on third attempt', async () => {
			const mockConversation = { escalatedToHuman: false, save: jest.fn() };
			Conversation.findOne.mockResolvedValue(mockConversation);

			const agent = createMockAgent({
				session: 'test-session-escalate',
				contexts: [{ name: 'fallback_count', lifespan: 5, parameters: { count: 2 } }],
			});

			await faqHandler.handleFallback(agent);

			expect(mockConversation.escalatedToHuman).toBe(true);
			expect(mockConversation.save).toHaveBeenCalledTimes(1);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/asesor|comunic/i);
		});

		it('should not throw if conversation not found during escalation', async () => {
			Conversation.findOne.mockResolvedValue(null);

			const agent = createMockAgent({
				contexts: [{ name: 'fallback_count', lifespan: 5, parameters: { count: 2 } }],
			});

			await expect(faqHandler.handleFallback(agent)).resolves.not.toThrow();
		});
	});

	// -------------------------------------------------------------------------
	// handleDerivarAgente
	// -------------------------------------------------------------------------
	describe('handleDerivarAgente', () => {
		it('should respond with DERIVAR_AGENTE when no active flow', async () => {
			const mockConversation = {
				escalatedToHuman: false,
				endedAt: null,
				save: jest.fn(),
				endConversation: jest.fn(),
			};
			Conversation.findOne.mockResolvedValue(mockConversation);

			const agent = createMockAgent();
			await faqHandler.handleDerivarAgente(agent);

			expect(mockConversation.escalatedToHuman).toBe(true);
			expect(mockConversation.save).toHaveBeenCalledTimes(2);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/asesor|atenderle/i);
		});

		it('should respond with DERIVAR_AGENTE_CON_FLUJO and clear contexts when flow is active', async () => {
			const mockConversation = {
				escalatedToHuman: false,
				endedAt: null,
				save: jest.fn(),
				endConversation: jest.fn(),
			};
			Conversation.findOne.mockResolvedValue(mockConversation);

			const agent = createMockAgent({
				contexts: [{ name: 'cita_local_en_curso', lifespan: 10, parameters: {} }],
			});
			await faqHandler.handleDerivarAgente(agent);

			expect(mockConversation.escalatedToHuman).toBe(true);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/cancelar|proceso/i);
		});

		it('should not throw if metrics update fails', async () => {
			Conversation.findOne.mockRejectedValue(new Error('DB error'));

			const agent = createMockAgent();
			await expect(faqHandler.handleDerivarAgente(agent)).resolves.not.toThrow();
			expect(agent.add).toHaveBeenCalledTimes(1);
		});

		it('should still respond when MetricsService.endConversation throws during derivar', async () => {
			// First call (markEscalatedToHuman) succeeds, second call (endConversation) fails
			const mockConversation = {
				escalatedToHuman: false,
				endedAt: null,
				save: jest.fn(),
				endConversation: jest.fn(),
			};
			// findOne returns conversation for escalation mark, then throws for endConversation
			Conversation.findOne
				.mockResolvedValueOnce(mockConversation) // markEscalatedToHuman
				.mockRejectedValueOnce(new Error('end failed')); // endConversation inner path

			const agent = createMockAgent();
			await expect(faqHandler.handleDerivarAgente(agent)).resolves.not.toThrow();
			expect(agent.add).toHaveBeenCalledTimes(1);
		});
	});

	// -------------------------------------------------------------------------
	// handleCancelarProceso — all branches
	// -------------------------------------------------------------------------
	describe('handleCancelarProceso', () => {
		it('should respond with "No tiene ningún proceso activo" when no flow is active', () => {
			const agent = createMockAgent();
			faqHandler.handleCancelarProceso(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/No tiene ningún proceso activo/i);
		});

		it('should cancel cita flow (cita_seleccion_tipo active) and mention "proceso de cita"', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_seleccion_tipo', lifespan: 5, parameters: {} }],
			});
			faqHandler.handleCancelarProceso(agent);
			expect(agent.context.set).toHaveBeenCalled();
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/proceso de cita/i);
		});

		it('should cancel cita_local flow (cita_local_en_curso active) and mention "cita en nuestro local"', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_local_en_curso', lifespan: 5, parameters: {} }],
			});
			faqHandler.handleCancelarProceso(agent);
			expect(agent.context.set).toHaveBeenCalled();
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/cita en nuestro local/i);
		});

		it('should cancel cita_domicilio flow (cita_domicilio_en_curso active) and mention "cita a domicilio"', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_domicilio_en_curso', lifespan: 5, parameters: {} }],
			});
			faqHandler.handleCancelarProceso(agent);
			expect(agent.context.set).toHaveBeenCalled();
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/cita a domicilio/i);
		});

		it('should cancel cotizacion flow (cotizacion_items active) and mention "cotización"', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cotizacion_items', lifespan: 5, parameters: {} }],
			});
			faqHandler.handleCancelarProceso(agent);
			expect(agent.context.set).toHaveBeenCalled();
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/cotizaci/i);
		});

		it('should fall back to "proceso" when activeFlow is not a known flowNames key', () => {
			// Arrange: spy on getActiveFlow so it returns a value absent from flowNames,
			// triggering the `flowNames[activeFlow] || 'proceso'` fallback on line ~243.
			const spy = jest.spyOn(faqHandler, 'getActiveFlow').mockReturnValue('unknown_flow');
			const agent = createMockAgent();

			// Act
			faqHandler.handleCancelarProceso(agent);

			// Assert
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/proceso/i);

			spy.mockRestore();
		});
	});
});
