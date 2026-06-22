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
				0.95
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
			await MetricsService.recordMessage(
				'session-002',
				'user-002',
				'bot',
				'Bienvenido',
				'saludo',
				null
			);

			const conversation = await Conversation.findOne({ sessionId: 'session-002' });
			expect(conversation.messages).toHaveLength(2);
			expect(conversation.totalMessages).toBe(2);
		});

		it('should record a bot message with responseDurationMs', async () => {
			const result = await MetricsService.recordMessage(
				'session-bot-dur',
				'user-x',
				'bot',
				'Respuesta del bot',
				'faq_horarios',
				null,
				'messenger',
				350
			);

			expect(result.messages[0].responseDurationMs).toBe(350);
		});
	});

	describe('recordInteraction', () => {
		it('should set escalatedToHuman when interaction failed with error', async () => {
			await MetricsService.recordMessage('session-003', 'user-003', 'user', 'Test', null, null);

			const startTime = Date.now() - 200;
			const endTime = Date.now();

			await MetricsService.recordInteraction({
				sessionId: 'session-003',
				userId: 'user-003',
				intent: 'faq_horarios',
				startTime,
				endTime,
				success: false,
				error: 'Intent handler failed',
			});

			const conversation = await Conversation.findOne({ sessionId: 'session-003' });
			expect(conversation.escalatedToHuman).toBe(true);
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
				})
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

		it('should be idempotent — calling endConversation twice does not error and endedAt remains set', async () => {
			await MetricsService.recordMessage('session-end-guard', 'user-g', 'user', 'Bye', null, null);
			await MetricsService.endConversation('session-end-guard');
			await expect(MetricsService.endConversation('session-end-guard')).resolves.not.toThrow();

			const conversation = await Conversation.findOne({ sessionId: 'session-end-guard' });
			// endedAt is set and conversation is resolved
			expect(conversation.endedAt).toBeDefined();
			expect(conversation.resolved).toBe(true);
		});

		it('should silently handle a non-existent session', async () => {
			await expect(MetricsService.endConversation('session-does-not-exist')).resolves.not.toThrow();
		});
	});

	describe('getStatistics', () => {
		it('should return zero stats when no conversations exist', async () => {
			const stats = await MetricsService.getStatistics(
				new Date('2000-01-01'),
				new Date('2000-01-02')
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

		it('should return non-null avgSatisfaction when a conversation has satisfactionRating > 0', async () => {
			await MetricsService.recordMessage('session-sat', 'user-sat', 'user', 'Hola', null, null);
			const conv = await Conversation.findOne({ sessionId: 'session-sat' });
			conv.satisfactionRating = 4;
			await conv.save();

			const start = new Date();
			start.setHours(0, 0, 0, 0);
			const end = new Date();
			end.setHours(23, 59, 59, 999);

			const stats = await MetricsService.getStatistics(start, end);
			expect(stats.avgSatisfaction).not.toBeNull();
			expect(stats.avgSatisfaction).toBeGreaterThan(0);
			expect(stats.ratingsCount).toBeGreaterThanOrEqual(1);
		});

		it('should return non-null avgResponseDurationMs when a bot message has responseDurationMs', async () => {
			// Record a bot message with responseDurationMs to trigger the non-null branch
			await MetricsService.recordMessage(
				'session-resp-dur',
				'user-rd',
				'bot',
				'Respuesta',
				'faq',
				null,
				'messenger',
				250
			);

			const start = new Date();
			start.setHours(0, 0, 0, 0);
			const end = new Date();
			end.setHours(23, 59, 59, 999);

			const stats = await MetricsService.getStatistics(start, end);
			expect(stats.avgResponseDurationMs).not.toBeNull();
			expect(stats.avgResponseDurationMs).toBeGreaterThan(0);
			expect(stats.totalResponseSamples).toBeGreaterThanOrEqual(1);
		});
	});
});
