/**
 * Creates a mock Dialogflow WebhookClient agent for unit testing.
 * @param {Object} options
 * @param {Object} options.parameters - Intent parameters
 * @param {Array}  options.contexts   - Active output contexts
 * @param {string} options.query      - Raw user query text
 * @param {string} options.session    - Session identifier
 * @returns {Object} Mock agent
 */
function createMockAgent({
	parameters = {},
	contexts = [],
	query = '',
	session = 'test-session-123',
} = {}) {
	const contextStore = new Map(contexts.map((c) => [c.name, c]));

	return {
		parameters,
		query,
		session,
		add: jest.fn(),
		end: jest.fn(),
		context: {
			get: jest.fn((name) => contextStore.get(name) || null),
			set: jest.fn((ctx) => contextStore.set(ctx.name, ctx)),
			delete: jest.fn((name) => contextStore.delete(name)),
		},
	};
}

module.exports = { createMockAgent };
