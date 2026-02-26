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
	});

	describe('handleGoodbye', () => {
		it('should respond with GOODBYE when no active flow', () => {
			const agent = createMockAgent();
			faqHandler.handleGoodbye(agent);
			expect(agent.add).toHaveBeenCalledTimes(1);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/gusto|excelente|día/i);
		});

		it('should warn about in-progress flow', () => {
			const agent = createMockAgent({
				contexts: [{ name: 'cita_local_en_curso', lifespan: 5, parameters: {} }],
			});
			faqHandler.handleGoodbye(agent);
			expect(agent.add.mock.calls[0][0]).toMatch(/proceso|momento/i);
		});
	});

	describe('handleHelp', () => {
		it('should list available options', () => {
			const agent = createMockAgent();
			faqHandler.handleHelp(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/cita|cotizaci|informaci/i);
		});
	});

	describe('handleHorarios', () => {
		it('should respond with business hours', () => {
			const agent = createMockAgent();
			faqHandler.handleHorarios(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/lunes|viernes|sábado/i);
		});
	});

	describe('handleUbicacion', () => {
		it('should respond with location information', () => {
			const agent = createMockAgent();
			faqHandler.handleUbicacion(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/paita|marco jara/i);
		});
	});

	describe('handleContacto', () => {
		it('should respond with contact information', () => {
			const agent = createMockAgent();
			faqHandler.handleContacto(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/teléfono|whatsapp|correo/i);
		});
	});

	describe('handleRedesSociales', () => {
		it('should respond with social media links', () => {
			const agent = createMockAgent();
			faqHandler.handleRedesSociales(agent);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/facebook|instagram/i);
		});
	});

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

	describe('handleDerivarAgente', () => {
		it('should respond with DERIVAR_AGENTE when no active flow', async () => {
			const mockConversation = { escalatedToHuman: false, save: jest.fn() };
			Conversation.findOne.mockResolvedValue(mockConversation);

			const agent = createMockAgent();
			await faqHandler.handleDerivarAgente(agent);

			expect(mockConversation.escalatedToHuman).toBe(true);
			expect(mockConversation.save).toHaveBeenCalledTimes(1);
			const msg = agent.add.mock.calls[0][0];
			expect(msg).toMatch(/asesor|atenderle/i);
		});

		it('should respond with DERIVAR_AGENTE_CON_FLUJO and clear contexts when flow is active', async () => {
			const mockConversation = { escalatedToHuman: false, save: jest.fn() };
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
	});
});
