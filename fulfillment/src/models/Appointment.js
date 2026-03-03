const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
	{
		referenceNumber: {
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
		equipmentType: {
			type: String,
			enum: ['PC', 'laptop', 'impresora', 'camara', 'monitor', 'otro'],
			required: true,
		},
		serviceType: {
			type: String,
			required: true,
		},
		problemDescription: {
			type: String,
			required: true,
		},
		appointmentType: {
			type: String,
			enum: ['local', 'domicilio'],
			required: true,
		},
		scheduledDate: {
			type: Date,
			required: true,
		},
		scheduledTime: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			default: null,
		},
		addressReference: {
			type: String,
			default: null,
		},
		status: {
			type: String,
			enum: ['pendiente', 'confirmada', 'completada', 'cancelada'],
			default: 'confirmada',
		},
		googleCalendarEventId: {
			type: String,
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
	},
);

AppointmentSchema.index({ scheduledDate: 1, scheduledTime: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ createdAt: -1 });

const AppointmentCounterSchema = new mongoose.Schema({
	_id: String,
	seq: { type: Number, default: 0 },
});

AppointmentSchema.statics.generateReferenceNumber = async function () {
	const date = new Date();
	const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

	const Counter = mongoose.models.AppointmentCounter ||
		mongoose.model('AppointmentCounter', AppointmentCounterSchema);

	const result = await Counter.findOneAndUpdate(
		{ _id: `cita-${dateStr}` },
		{ $inc: { seq: 1 } },
		{ upsert: true, new: true },
	);

	const sequence = String(result.seq).padStart(3, '0');
	return `CITA-${dateStr}-${sequence}`;
};

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
