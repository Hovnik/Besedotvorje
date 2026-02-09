const mongoose = require("mongoose");

const wordInfoSchema = new mongoose.Schema({
  wordId: { type: mongoose.Schema.Types.ObjectId, ref: "Word", required: true },
  potrjeno: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  votes: [
    {
      ipHash: String,
      voteType: { type: String, enum: ["like", "dislike"] },
    },
  ],
  accessCount: { type: Number, default: 1 },
});

const WordMetadata = mongoose.model("WordMetadata", wordInfoSchema);

module.exports = WordMetadata;
