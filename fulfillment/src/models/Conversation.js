const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
	role: {
		type: String,
		enum: ['user', 'bot'],
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	intent: {
		type: String,
		default: null,
	},
	confidence: {
		type: Number,
		min: 0,
		max: 1,
		default: null,
	},
	responseDurationMs: {
		type: Number,
		min: 0,
		default: null,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

const ConversationSchema = new mongoose.Schema(
	{
		sessionId: {
			type: String,
			required: true,
			index: true,
		},
		userId: {
			type: String,
			required: true,
			index: true,
		},
		channel: {
			type: String,
			enum: ['messenger', 'web', 'test'],
			default: 'messenger',
		},
		messages: [MessageSchema],
		resolved: {
			type: Boolean,
			default: false,
		},
		escalatedToHuman: {
			type: Boolean,
			default: false,
		},
		satisfactionRating: {
			type: Number,
			min: 1,
			max: 5,
			default: null,
		},
		totalMessages: {
			type: Number,
			default: 0,
		},
		totalDurationMs: {
			type: Number,
			default: 0,
		},
		startedAt: {
			type: Date,
			default: Date.now,
		},
		endedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

ConversationSchema.index({ sessionId: 1, userId: 1 });
ConversationSchema.index({ startedAt: -1 });

ConversationSchema.methods.addMessage = function (
	role,
	content,
	intent = null,
	confidence = null,
	responseDurationMs = null
) {
	this.messages.push({
		role,
		content,
		intent,
		confidence,
		responseDurationMs,
		timestamp: new Date(),
	});
	this.totalMessages = this.messages.length;
};

ConversationSchema.methods.endConversation = function () {
	this.endedAt = new Date();
	this.totalDurationMs = this.endedAt - this.startedAt;
	this.resolved = true;
};

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
