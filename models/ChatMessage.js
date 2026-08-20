const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  clientName: { type: String, default: 'Guest Client' },
  clientEmail: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: String, enum: ['client', 'admin'], default: 'client' },
  status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);