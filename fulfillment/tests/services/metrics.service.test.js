require('../setup');
const MetricsService = require('../../src/services/metrics.service');
const Conversation = require('../../src/models/Conversation');

describe('MetricsService', () => {
	describe('recordMessage', () => {
		it('should create a new conversation on first message', async () => {
			const result = await MetricsService.recordMessage(
				'session-001',
				'user-001',
				'user',
				'Hola',
				'saludo',
				0.95,
			);

			expect(result).toBeDefined();
			expect(result.sessionId).toBe('session-001');
			expect(result.messages).toHaveLength(1);
			expect(result.messages[0].role).toBe('user');
			expect(result.messages[0].content).toBe('Hola');
			expect(result.messages[0].intent).toBe('saludo');
		});

		it('should append to existing conversation on subsequent messages', async () => {
			await MetricsService.recordMessage('session-002', 'user-002', 'user', 'Hola', 'saludo', 0.9);
			await MetricsService.recordMessage('session-002', 'user-002', 'bot', 'Bienvenido', 'saludo', null);

			const conversation = await Conversation.findOne({ sessionId: 'session-002' });
			expect(conversation.messages).toHaveLength(2);
			expect(conversation.totalMessages).toBe(2);
		});
	});

	describe('recordInteraction', () => {
		it('should update totalDurationMs on existing conversation', async () => {
			await MetricsService.recordMessage('session-003', 'user-003', 'user', 'Test', null, null);

			const startTime = Date.now() - 200;
			const endTime = Date.now();

			await MetricsService.recordInteraction({
				sessionId: 'session-003',
				userId: 'user-003',
				intent: 'faq_horarios',
				startTime,
				endTime,
				success: true,
			});

			const conversation = await Conversation.findOne({ sessionId: 'session-003' });
			expect(conversation.totalDurationMs).toBeGreaterThan(0);
		});

		it('should not throw when conversation does not exist', async () => {
			await expect(
				MetricsService.recordInteraction({
					sessionId: 'non-existent-session',
					userId: 'user-x',
					intent: 'test',
					startTime: Date.now(),
					endTime: Date.now(),
					success: true,
				}),
			).resolves.not.toThrow();
		});
	});

	describe('endConversation', () => {
		it('should set endedAt and resolved = true', async () => {
			await MetricsService.recordMessage('session-004', 'user-004', 'user', 'Gracias', null, null);
			await MetricsService.endConversation('session-004');

			const conversation = await Conversation.findOne({ sessionId: 'session-004' });
			expect(conversation.resolved).toBe(true);
			expect(conversation.endedAt).toBeDefined();
		});
	});

	describe('getStatistics', () => {
		it('should return zero stats when no conversations exist', async () => {
			const stats = await MetricsService.getStatistics(
				new Date('2000-01-01'),
				new Date('2000-01-02'),
			);

			expect(stats.totalConversations).toBe(0);
			expect(stats.resolutionRate).toBe(0);
			expect(stats.escalationRate).toBe(0);
		});

		it('should compute escalationRate correctly', async () => {
			await MetricsService.recordMessage('session-010', 'user-010', 'user', 'agente', null, null);
			const conv = await Conversation.findOne({ sessionId: 'session-010' });
			conv.escalatedToHuman = true;
			await conv.save();

			await MetricsService.recordMessage('session-011', 'user-011', 'user', 'hola', null, null);

			const start = new Date();
			start.setHours(0, 0, 0, 0);
			const end = new Date();
			end.setHours(23, 59, 59, 999);

			const stats = await MetricsService.getStatistics(start, end);
			expect(stats.escalatedConversations).toBeGreaterThanOrEqual(1);
			expect(stats.escalationRate).toBeGreaterThan(0);
		});
	});
});
