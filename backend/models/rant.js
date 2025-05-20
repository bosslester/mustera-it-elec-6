const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const rantSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: String, required: true },
  postId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [replySchema]
});

module.exports = mongoose.model('Rant', rantSchema);