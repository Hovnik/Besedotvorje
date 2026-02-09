const OpenAI = require("openai");
const Word = require("../models/Word");
const WordMetadata = require("../models/WordMetadata");
const crypto = require("crypto");
const {
  fetchWordsWithMetadata,
  filterUnverifiedWords,
  filterVerifiedWords,
  getWordsWithDislikes,
  countVerifiedWords,
} = require("../utils/wordHelpers");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model ID - can be base model or fine-tuned model
const MODEL_ID = process.env.FT_MODEL_ID || "gpt-4.1-mini";

/**
 * Build the strict prompt that enforces JSON output
 */
function buildPrompt(word) {
  return `You are a linguistic analyzer for Slovenian word formation.

RULES:
- Output ONLY valid JSON
- No explanations
- No extra fields
- Use only these postopek values: "izpeljava", "zlaganje", "netvorjenka"

SCHEMA:
{
  "beseda": string,
  "tvorjenka": boolean,
  "postopek": "izpeljava" | "zlaganje" | "netvorjenka",
  "slovnicno": {
    "besedna_vrsta"?: "samostalnik" | "pridevnik" | "glagol" | "prislov",
    "spol"?: "moški" | "ženski" | "srednji",
    "koncnica"?: string
  },
  "osnova"?: string,
  "predpone"?: string[],
  "pripone"?: string[],
  "osnove"?: string[],
  "confidence": number
}

Analyze this word:
"${word}"`;
}

/**
 * Call OpenAI API with strict JSON formatting
 */
async function analyzeWordWithAI(word, modelId = MODEL_ID) {
  try {
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "system",
          content:
            "You are a Slovenian word-formation analyzer. You output only valid JSON. Never add explanations or extra text.",
        },
        {
          role: "user",
          content: buildPrompt(word),
        },
      ],
      temperature: 0, // Very important for morphology - deterministic output
      response_format: { type: "json_object" }, // Force JSON mode
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("AI Analysis Error:", error.message);
    throw new Error("Failed to analyze word with AI");
  }
}

/**
 * Validate AI output BEFORE saving to database
 */
function validateAIOutput(data) {
  // Required fields
  if (!data.beseda || typeof data.beseda !== "string") {
    throw new Error(
      "Invalid AI output: beseda is required and must be a string",
    );
  }

  if (typeof data.tvorjenka !== "boolean") {
    throw new Error("Invalid AI output: tvorjenka must be a boolean");
  }

  if (!["izpeljava", "zlaganje", "netvorjenka"].includes(data.postopek)) {
    throw new Error(
      "Invalid AI output: postopek must be izpeljava, zlaganje, or netvorjenka",
    );
  }

  // Validation based on postopek
  if (data.postopek === "izpeljava" && !data.osnova) {
    throw new Error("Invalid AI output: izpeljava requires osnova");
  }

  if (
    data.postopek === "zlaganje" &&
    (!data.osnove || data.osnove.length < 2)
  ) {
    throw new Error("Invalid AI output: zlaganje requires at least 2 osnove");
  }

  // Confidence must be between 0 and 1
  if (
    typeof data.confidence !== "number" ||
    data.confidence < 0 ||
    data.confidence > 1
  ) {
    throw new Error(
      "Invalid AI output: confidence must be a number between 0 and 1",
    );
  }

  return true;
}

/**
 * Save word and metadata to database
 */
async function saveWordToDatabase(aiData) {
  // Create the Word document
  const word = new Word({
    beseda: aiData.beseda.toLowerCase().trim(),
    tvorjenka: aiData.tvorjenka,
    postopek: aiData.postopek,
    slovnicno: aiData.slovnicno || {},
    osnova: aiData.osnova || undefined,
    predpone: aiData.predpone || [],
    pripone: aiData.pripone || [],
    osnove: aiData.osnove || [],
    confidence: aiData.confidence,
  });

  await word.save();

  // Create metadata for the word
  await WordMetadata.create({
    wordId: word._id,
    confidence: aiData.confidence,
    potrjeno: false, // Will be confirmed by human later
  });

  return word;
}

/**
 * Main controller: Analyze a word
 */
exports.analyzeWord = async (req, res) => {
  try {
    const { beseda } = req.body;

    // Validate input
    if (!beseda || typeof beseda !== "string") {
      return res.status(400).json({
        error: "Please provide a valid word (beseda)",
      });
    }

    const wordToAnalyze = beseda.toLowerCase().trim();

    // Check if word already exists in database
    let existingWord = await Word.findOne({ beseda: wordToAnalyze });

    if (existingWord) {
      // Word exists - get metadata and increment access count
      const metadata = await WordMetadata.findOneAndUpdate(
        { wordId: existingWord._id },
        { $inc: { accessCount: 1 } },
        { new: true, upsert: true },
      );

      return res.json({
        source: "database",
        data: existingWord,
        metadata: {
          likes: metadata.likes || 0,
          dislikes: metadata.dislikes || 0,
        },
      });
    }

    // Word doesn't exist - analyze with AI
    const aiResult = await analyzeWordWithAI(wordToAnalyze);

    // Validate AI output
    validateAIOutput(aiResult);

    // Save to database
    const savedWord = await saveWordToDatabase(aiResult);

    // Get metadata for the new word
    const metadata = await WordMetadata.findOne({ wordId: savedWord._id });

    return res.json({
      source: "ai",
      data: savedWord,
      metadata: {
        likes: metadata?.likes || 0,
        dislikes: metadata?.dislikes || 0,
      },
    });
  } catch (error) {
    console.error("Error in analyzeWord:", error);
    return res.status(500).json({
      error: "Failed to analyze word",
      details: error.message,
    });
  }
};

/**
 * Update an existing word
 */
exports.updateWord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        error: "Word ID is required",
      });
    }

    // Find the word
    const word = await Word.findById(id);
    if (!word) {
      return res.status(404).json({
        error: "Word not found",
      });
    }

    // Validate and update fields
    if (typeof updateData.tvorjenka === "boolean") {
      word.tvorjenka = updateData.tvorjenka;

      // If not tvorjenka, set postopek to netvorjenka
      if (!updateData.tvorjenka) {
        word.postopek = "netvorjenka";
      }
    }

    if (
      updateData.postopek &&
      ["izpeljava", "zlaganje", "netvorjenka"].includes(updateData.postopek)
    ) {
      word.postopek = updateData.postopek;
    }

    // Update slovnicno
    if (updateData.slovnicno) {
      word.slovnicno = word.slovnicno || {};

      if (updateData.slovnicno.besedna_vrsta) {
        word.slovnicno.besedna_vrsta = updateData.slovnicno.besedna_vrsta;
      }
      if (updateData.slovnicno.spol) {
        word.slovnicno.spol = updateData.slovnicno.spol;
      }
      if (updateData.slovnicno.koncnica !== undefined) {
        word.slovnicno.koncnica = updateData.slovnicno.koncnica || undefined;
      }

      // Mark nested object as modified for Mongoose
      word.markModified("slovnicno");
    }

    // Update izpeljava fields
    if (word.postopek === "izpeljava") {
      // Clear zlaganje fields
      word.osnove = [];
      word.markModified("osnove");

      // Update izpeljava fields
      if (updateData.osnova !== undefined) {
        word.osnova = updateData.osnova;
      }
      if (Array.isArray(updateData.predpone)) {
        word.predpone = [...updateData.predpone];
        word.markModified("predpone");
      }
      if (Array.isArray(updateData.pripone)) {
        word.pripone = [...updateData.pripone];
        word.markModified("pripone");
      }
    }
    // Update zlaganje fields
    else if (word.postopek === "zlaganje") {
      // Clear izpeljava fields
      word.osnova = undefined;
      word.predpone = [];
      word.pripone = [];
      word.markModified("predpone");
      word.markModified("pripone");

      // Update osnove
      if (Array.isArray(updateData.osnove)) {
        word.osnove = [...updateData.osnove];
        word.markModified("osnove");
      }
    }
    // Clear all derivative fields for netvorjenka
    else if (word.postopek === "netvorjenka") {
      word.osnova = undefined;
      word.predpone = [];
      word.pripone = [];
      word.osnove = [];
      word.markModified("predpone");
      word.markModified("pripone");
      word.markModified("osnove");
    }

    // Save updated word
    await word.save();

    // Reload from database to ensure we have fresh data
    const updatedWord = await Word.findById(word._id);

    return res.json({
      success: true,
      word: updatedWord,
    });
  } catch (error) {
    console.error("Error in updateWord:", error);
    return res.status(500).json({
      error: "Failed to update word",
      details: error.message,
    });
  }
};

/**
 * Vote on a word (like/dislike)
 */
exports.voteOnWord = async (req, res) => {
  try {
    const { wordId } = req.params;
    const { voteType } = req.body; // 'like', 'dislike', or null to remove vote

    // Validate input
    if (!wordId) {
      return res.status(400).json({
        error: "Word ID is required",
      });
    }

    if (voteType && !["like", "dislike"].includes(voteType)) {
      return res.status(400).json({
        error: "Vote type must be 'like' or 'dislike'",
      });
    }

    // Get user's IP address (hashed for privacy)
    const ip = req.ip || req.connection.remoteAddress;
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    // Find or create metadata for this word
    let metadata = await WordMetadata.findOne({ wordId });

    if (!metadata) {
      // Create new metadata if it doesn't exist
      metadata = new WordMetadata({
        wordId,
        likes: 0,
        dislikes: 0,
        votes: [],
      });
    }

    // Find user's previous vote
    const existingVoteIndex = metadata.votes.findIndex(
      (vote) => vote.ipHash === ipHash,
    );

    const previousVote =
      existingVoteIndex >= 0 ? metadata.votes[existingVoteIndex] : null;

    // Remove previous vote counts
    if (previousVote) {
      if (previousVote.voteType === "like") {
        metadata.likes = Math.max(0, metadata.likes - 1);
      } else if (previousVote.voteType === "dislike") {
        metadata.dislikes = Math.max(0, metadata.dislikes - 1);
      }

      // Remove the vote from array
      metadata.votes.splice(existingVoteIndex, 1);
    }

    // Add new vote if provided
    if (voteType) {
      if (voteType === "like") {
        metadata.likes += 1;
      } else if (voteType === "dislike") {
        metadata.dislikes += 1;
      }

      // Add to votes array
      metadata.votes.push({
        ipHash,
        voteType,
      });
    }

    // Save metadata
    await metadata.save();

    return res.json({
      success: true,
      likes: metadata.likes,
      dislikes: metadata.dislikes,
    });
  } catch (error) {
    console.error("Error in voteOnWord:", error);
    return res.status(500).json({
      error: "Failed to vote on word",
      details: error.message,
    });
  }
};

/**
 * Get unverified words (potrjeno = false or not set)
 * Ordered by confidence (lowest first)
 * Paginated by 20 per page
 */
exports.getUnverifiedWords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const { words, metadataMap } = await fetchWordsWithMetadata();
    const unverifiedWords = filterUnverifiedWords(words, metadataMap);

    unverifiedWords.sort((a, b) => (a.confidence || 0) - (b.confidence || 0));

    const paginatedWords = unverifiedWords.slice(skip, skip + limit);
    const totalPages = Math.ceil(unverifiedWords.length / limit);

    return res.json({
      words: paginatedWords,
      pagination: {
        currentPage: page,
        totalPages,
        totalWords: unverifiedWords.length,
        wordsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error in getUnverifiedWords:", error);
    return res.status(500).json({
      error: "Failed to fetch unverified words",
      details: error.message,
    });
  }
};

/**
 * Get verified words (paginated)
 * Paginated by 20 per page
 */
exports.getVerifiedWords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const { words, metadataMap } = await fetchWordsWithMetadata();
    const verifiedWords = filterVerifiedWords(words, metadataMap);

    // Sort by confidence (lowest first, like unverified)
    verifiedWords.sort((a, b) => (a.confidence || 0) - (b.confidence || 0));

    const paginatedWords = verifiedWords.slice(skip, skip + limit);
    const totalPages = Math.ceil(verifiedWords.length / limit);

    return res.json({
      words: paginatedWords,
      pagination: {
        currentPage: page,
        totalPages,
        totalWords: verifiedWords.length,
        wordsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error in getVerifiedWords:", error);
    return res.status(500).json({
      error: "Failed to fetch verified words",
      details: error.message,
    });
  }
};

/**
 * Mark a word as verified (potrjeno = true)
 */
exports.verifyWord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "Word ID is required",
      });
    }

    // Check if word exists
    const word = await Word.findById(id);
    if (!word) {
      return res.status(404).json({
        error: "Word not found",
      });
    }

    // Update metadata to mark as verified
    await WordMetadata.findOneAndUpdate(
      { wordId: id },
      { potrjeno: true },
      { upsert: true },
    );

    return res.json({
      success: true,
      message: "Word marked as verified",
    });
  } catch (error) {
    console.error("Error in verifyWord:", error);
    return res.status(500).json({
      error: "Failed to verify word",
      details: error.message,
    });
  }
};

/**
 * Get most unliked words (sorted by number of dislikes)
 */
exports.getMostUnlikedWords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Get all words
    const allWords = await Word.find().lean();

    // Get metadata for all words
    const wordIds = allWords.map((w) => w._id);
    const metadata = await WordMetadata.find({
      wordId: { $in: wordIds },
    }).lean();

    // Create a map of wordId -> metadata with dislike count
    const wordWithDislikes = [];
    metadata.forEach((meta) => {
      const word = allWords.find(
        (w) => w._id.toString() === meta.wordId.toString(),
      );
      if (word && meta.votes && meta.votes.length > 0) {
        // Count dislikes (voteType: "dislike")
        const dislikeCount = meta.votes.filter(
          (v) => v.voteType === "dislike",
        ).length;
        if (dislikeCount > 0) {
          wordWithDislikes.push({
            ...word,
            dislikeCount,
          });
        }
      }
    });

    // Sort by dislike count (highest first)
    wordWithDislikes.sort((a, b) => b.dislikeCount - a.dislikeCount);

    // Paginate
    const paginatedWords = wordWithDislikes.slice(skip, skip + limit);
    const totalPages = Math.ceil(wordWithDislikes.length / limit);

    return res.json({
      words: paginatedWords,
      pagination: {
        currentPage: page,
        totalPages,
        totalWords: wordWithDislikes.length,
        wordsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error in getMostUnlikedWords:", error);
    return res.status(500).json({
      error: "Failed to fetch most unliked words",
      details: error.message,
    });
  }
};

/**
 * Get count of verified words
 */
exports.getVerifiedWordsCount = async (req, res) => {
  try {
    const { metadataMap } = await fetchWordsWithMetadata();
    const verifiedCount = countVerifiedWords(metadataMap);

    return res.json({ count: verifiedCount });
  } catch (error) {
    console.error("Error in getVerifiedWordsCount:", error);
    return res.status(500).json({
      error: "Failed to fetch verified words count",
      details: error.message,
    });
  }
};
