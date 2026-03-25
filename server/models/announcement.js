const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  priority: {
    type: String,
    enum: ['normal', 'important', 'urgent'],
    default: 'normal'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  readBy: [{
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    readAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
