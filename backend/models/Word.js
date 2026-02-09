const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  beseda: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  tvorjenka: {
    type: Boolean,
    required: true,
  },

  postopek: {
    type: String,
    enum: ["izpeljava", "zlaganje", "netvorjenka"],
    required: true,
  },

  slovnicno: {
    besedna_vrsta: {
      type: String,
      enum: ["samostalnik", "pridevnik", "glagol", "prislov"],
    },
    spol: {
      type: String,
      enum: ["moški", "ženski", "srednji"],
    },
    koncnica: { type: String },
  },

  /* IZPELJAVA */
  osnova: { type: String },
  predpone: { type: [String], default: [] },
  pripone: { type: [String], default: [] },

  /* ZLAGANJE */
  osnove: { type: [String], default: [] },

  confidence: { type: Number, min: 0, max: 1 },
});

const Word = mongoose.model("Word", wordSchema);

module.exports = Word;
