const Conversation = require('../models/Conversation');

class MetricsService {
	/**
	 * Records a conversation message for metrics tracking
	 * @param {string} sessionId - Session identifier
	 * @param {string} userId - User identifier
	 * @param {string} role - Message role (user or bot)
	 * @param {string} content - Message content
	 * @param {string} intent - Detected intent
	 * @param {number} confidence - Intent confidence score
	 * @param {string} channel - Communication channel
	 * @param {number} responseDurationMs - Response time in ms (bot messages only)
	 * @returns {Promise<Conversation>}
	 */
	static async recordMessage(
		sessionId,
		userId,
		role,
		content,
		intent = null,
		confidence = null,
		channel = 'messenger',
		responseDurationMs = null,
	) {
		try {
			let conversation = await Conversation.findOne({ sessionId });

			if (!conversation) {
				conversation = new Conversation({
					sessionId,
					userId,
					channel,
					messages: [],
					startedAt: new Date(),
				});
			} else if (conversation.channel === 'whatsapp') {
				conversation.channel = 'messenger';
			}

			conversation.addMessage(role, content, intent, confidence, responseDurationMs);
			await conversation.save();

			console.log(`[Metrics] Message recorded for session: ${sessionId}`);
			return conversation;
		} catch (error) {
			console.error('[Metrics] Error recording message:', error);
			throw error;
		}
	}

	/**
	 * Records an interaction for thesis metrics
	 * @param {Object} data - Interaction data
	 * @returns {Promise<void>}
	 */
	static async recordInteraction(data) {
		const { sessionId, userId, intent, startTime, endTime, success, error } =
			data;

		try {
			const conversation = await Conversation.findOne({ sessionId });

			if (conversation) {
				if (conversation.channel === 'whatsapp') {
					conversation.channel = 'messenger';
				}

				if (!success && error) {
					conversation.escalatedToHuman = true;
				}

				await conversation.save();
			} else {
				// M3: Log warning so missing metrics are visible without crashing
				console.warn(
					`[Metrics] Conversation not found for session: ${sessionId} — interaction not recorded`,
				);
			}

			console.log(
				`[Metrics] Interaction recorded: ${intent} (${endTime - startTime}ms)`,
			);
		} catch (error) {
			console.error('[Metrics] Error recording interaction:', error);
		}
	}

	/**
	 * Ends a conversation session
	 * @param {string} sessionId - Session identifier
	 * @returns {Promise<void>}
	 */
	static async endConversation(sessionId) {
		try {
			const conversation = await Conversation.findOne({ sessionId });

			if (conversation && !conversation.endedAt) {
				if (conversation.channel === 'whatsapp') {
					conversation.channel = 'messenger';
				}
				conversation.endConversation();
				await conversation.save();
				console.log(`[Metrics] Conversation ended: ${sessionId}`);
			}
		} catch (error) {
			console.error('[Metrics] Error ending conversation:', error);
		}
	}

	/**
	 * Gets conversation statistics for thesis analysis
	 * @param {Date} startDate - Start date for statistics
	 * @param {Date} endDate - End date for statistics
	 * @returns {Promise<Object>}
	 */
	static async getStatistics(startDate, endDate) {
		try {
			const conversations = await Conversation.find({
				startedAt: {
					$gte: startDate,
					$lte: endDate,
				},
			});

			const totalConversations = conversations.length;
			const resolvedConversations = conversations.filter(
				(c) => c.resolved,
			).length;
			const escalatedConversations = conversations.filter(
				(c) => c.escalatedToHuman,
			).length;

			const totalMessages = conversations.reduce(
				(sum, c) => sum + c.totalMessages,
				0,
			);
			const avgMessagesPerConversation =
				totalConversations > 0 ? totalMessages / totalConversations : 0;

			const totalDuration = conversations.reduce(
				(sum, c) => sum + c.totalDurationMs,
				0,
			);
			const avgDurationMs =
				totalConversations > 0 ? totalDuration / totalConversations : 0;

			const ratings = conversations
				.filter((c) => c.satisfactionRating)
				.map((c) => c.satisfactionRating);
			const avgSatisfaction =
				ratings.length > 0
					? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
					: null;

			const responseTimes = conversations.flatMap((c) =>
				c.messages
					.filter((m) => m.role === 'bot' && m.responseDurationMs != null)
					.map((m) => m.responseDurationMs),
			);
			const avgResponseDurationMs =
				responseTimes.length > 0
					? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
					: null;

			return {
				totalConversations,
				resolvedConversations,
				escalatedConversations,
				resolutionRate:
					totalConversations > 0
						? (resolvedConversations / totalConversations) * 100
						: 0,
				escalationRate:
					totalConversations > 0
						? (escalatedConversations / totalConversations) * 100
						: 0,
				avgMessagesPerConversation,
				avgDurationMs,
				avgDurationSeconds: avgDurationMs / 1000,
				avgResponseDurationMs,
				avgResponseDurationSeconds: avgResponseDurationMs ? avgResponseDurationMs / 1000 : null,
				totalResponseSamples: responseTimes.length,
				avgSatisfaction,
				ratingsCount: ratings.length,
			};
		} catch (error) {
			console.error('[Metrics] Error getting statistics:', error);
			throw error;
		}
	}
}

module.exports = MetricsService;
