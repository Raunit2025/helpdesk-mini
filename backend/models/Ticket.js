const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed'],
    default: 'open',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  slaDeadline: { type: Date, required: true },
  version: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);