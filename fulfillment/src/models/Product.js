const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
	{
		sku: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		category: {
			type: String,
			required: true,
			enum: [
				'computadora',
				'laptop',
				'impresora',
				'accesorio',
				'componente',
				'camara',
				'monitor',
			],
		},
		name: {
			type: String,
			required: true,
		},
		brand: {
			type: String,
			required: true,
		},
		model: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: '',
		},
		specifications: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		stock: {
			type: Number,
			default: 0,
			min: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
