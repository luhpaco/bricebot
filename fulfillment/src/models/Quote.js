const mongoose = require('mongoose');

const QuoteItemSchema = new mongoose.Schema({
	productId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
		default: null,
	},
	name: {
		type: String,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	unitPrice: {
		type: Number,
		required: true,
		min: 0,
	},
	subtotal: {
		type: Number,
		required: true,
		min: 0,
	},
});

const QuoteSchema = new mongoose.Schema(
	{
		quoteNumber: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		clientName: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			default: null,
		},
		clientType: {
			type: String,
			enum: ['natural', 'juridico'],
			default: 'natural',
		},
		ruc: {
			type: String,
			default: null,
		},
		companyName: {
			type: String,
			default: null,
		},
		quoteType: {
			type: String,
			enum: ['producto', 'servicio', 'mixto'],
			required: true,
		},
		items: [QuoteItemSchema],
		subtotal: {
			type: Number,
			required: true,
			min: 0,
		},
		igv: {
			type: Number,
			required: true,
			min: 0,
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		validUntil: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ['generada', 'enviada', 'aceptada', 'rechazada'],
			default: 'generada',
		},
		sentVia: {
			type: String,
			enum: ['messenger', 'email'],
			default: null,
		},
		creationStartTime: {
			type: Date,
			required: true,
		},
		creationEndTime: {
			type: Date,
			required: true,
		},
		creationDurationMs: {
			type: Number,
			required: true,
		},
		createdByChatbot: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

QuoteSchema.index({ status: 1 });
QuoteSchema.index({ createdAt: -1 });
QuoteSchema.index({ validUntil: 1 });

const QuoteCounterSchema = new mongoose.Schema({
	_id: String,
	seq: { type: Number, default: 0 },
});

QuoteSchema.statics.generateQuoteNumber = async function () {
	const date = new Date();
	const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

	const Counter =
		mongoose.models.QuoteCounter || mongoose.model('QuoteCounter', QuoteCounterSchema);

	const result = await Counter.findOneAndUpdate(
		{ _id: `cot-${dateStr}` },
		{ $inc: { seq: 1 } },
		{ upsert: true, new: true }
	);

	const sequence = String(result.seq).padStart(3, '0');
	return `COT-${dateStr}-${sequence}`;
};

const Quote = mongoose.model('Quote', QuoteSchema);

module.exports = Quote;
