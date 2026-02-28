const mongoose = require("mongoose");

const morphemeSchema = new mongoose.Schema(
  {
    tip: {
      type: String,
      enum: ["osnova", "predpona", "pripona", "medpona"],
      required: true,
    },
    vrednost: {
      type: String,
      required: true,
    },
    pozicija: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const wordSchema = new mongoose.Schema({
  beseda: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  tvorjenka: {
    type: Boolean,
    required: true,
  },

  postopek: {
    type: [String],
    enum: [
      "izpeljanka",
      "zloženka",
      "sestavljenka",
      "tvorjenka iz predložne zveze",
      "sklop",
      "krn",
      "mešana tvorba",
      "netvorjenka",
    ],
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

  /* UNIVERZALNA MORFEMSKA STRUKTURA */
  morfemi: {
    type: [morphemeSchema],
    default: [],
  },

  confidence: { type: Number, min: 0, max: 1 },
});

const Word = mongoose.model("Word", wordSchema);

module.exports = Word;
