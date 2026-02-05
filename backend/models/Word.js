const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  type: {
    type: String,
    default: "",
  },
  analysis: {
    type: String,
    required: true,
  },
  // how many users liked this and disliked this
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  // Track votes by IP (hashed for privacy)
  votes: [
    {
      ipHash: String,
      voteType: String, // 'like' or 'dislike'
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
  accessCount: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Word", wordSchema);
