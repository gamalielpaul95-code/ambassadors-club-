const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'replied'],
    default: 'pending'
  },
  reply: {
    message: String,
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    repliedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
