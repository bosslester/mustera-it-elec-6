const mongoose = require('mongoose');

// UserReaction sub-schema
const userReactionSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'love', 'laugh', 'sad'], required: true }
});

// Comment sub-schema
const commentSchema = mongoose.Schema({
  text: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
  },
  userReactions: [userReactionSchema]
});

// Create Post Schema
const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comments: [commentSchema],
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
  },
  userReactions: [userReactionSchema]
});

// Export Post Model
module.exports = mongoose.model('Post', postSchema);