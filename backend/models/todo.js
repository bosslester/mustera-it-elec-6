const mongoose = require('mongoose');

const todoSchema = mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: String
});

module.exports = mongoose.model('Todo', todoSchema);
