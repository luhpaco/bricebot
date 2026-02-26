const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: '',
		},
		category: {
			type: String,
			required: true,
			enum: ['reparacion', 'mantenimiento', 'instalacion', 'software'],
		},
		equipmentTypes: {
			type: [String],
			default: [],
		},
		basePrice: {
			type: Number,
			required: true,
			min: 0,
		},
		estimatedDuration: {
			type: String,
			default: '',
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

ServiceSchema.index({ category: 1, isActive: 1 });
ServiceSchema.index({ equipmentTypes: 1 });

const Service = mongoose.model('Service', ServiceSchema);

module.exports = Service;
