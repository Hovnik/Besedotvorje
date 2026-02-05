const OpenAI = require("openai");
const Word = require("../models/Word");
const crypto = require("crypto");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The prompt template
const PROMPT_TEMPLATE = `Navedi besedotvorno podstavo besede: {word}.
Besedotvorna podstava vključuje **celotno tvorjenko**, torej vse sestavne dele besede, kot je zgrajena.
- Če beseda ni tvorjenka, odgovori samo: "Ni tvorjenka".
- Naj bo odgovor kratek in brez pojasnil.

Primeri:
Učenec -> uč-enec
Vstopati -> v-stop-ati
Mizar -> miz-ar
Avtocesta -> avt-o-cest-a
Zakonolom -> zakon-o-lom
Podoficir -> pod-oficir
Okoljevarstvenik -> okolje-varstv-enik
Nadstrešek -> nad-streš-ek
Drobcken -> drob-ck-en
Gasilec -> gas-ilec

Bodi še pozoren na posebne primere, kot so:
Križišče -> križ-išče
Srednješolec -> srednj-e-šol-ec
Srednjeveški -> srednj-e-veški

Vrni le kar je na desni strani puščice ->.
Če beseda je tvorjenka, navedi tip tvorjenke (npr. "izpeljanka", "zloženka", "sestavljenka", "krn", "mešana tvorba", "sklop") na koncu odgovora.
`;

// Extract word type from analysis (e.g., "izpeljanka", "zloženka")
const extractWordType = (analysis) => {
  if (!analysis) return { cleanAnalysis: analysis, wordType: null };

  // Look for specific word types
  const typeKeywords = [
    "izpeljanka",
    "zloženka",
    "sestavljenka",
    "krn",
    "mešana tvorba",
    "sklop",
  ];

  // Try to find the type keyword in the text
  for (const keyword of typeKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(analysis)) {
      // Remove the type information from the analysis, including preceding commas
      const cleanAnalysis = analysis
        .replace(
          new RegExp(
            `\\s*,?\\s*\\(?\\s*${keyword}\\s*\\)?\\s*[.,;]*\\s*`,
            "gi",
          ),
          " ",
        )
        .replace(/\s+/g, " ")
        .replace(/,\s*$/, "") // Remove trailing comma
        .trim();
      return { cleanAnalysis, wordType: keyword };
    }
  }

  return { cleanAnalysis: analysis, wordType: null };
};

exports.analyzeWord = async (req, res) => {
  try {
    const { word } = req.body;

    // Input validation
    if (!word || typeof word !== "string" || !word.trim()) {
      return res.status(400).json({ error: "Word is required" });
    }

    // Sanitize input: remove special characters except Slovenian letters
    const sanitized = word.trim().replace(/[^a-zA-ZčćžšđČĆŽŠĐ\s-]/g, "");

    if (!sanitized) {
      return res.status(400).json({ error: "Invalid word format" });
    }

    // Length validation (prevent extremely long inputs)
    if (sanitized.length > 50) {
      return res
        .status(400)
        .json({ error: "Word is too long (max 50 characters)" });
    }

    const normalizedWord = sanitized.toLowerCase();

    // Check if word exists in database
    let wordDoc = await Word.findOne({ word: normalizedWord });

    if (wordDoc) {
      // Word found in DB - return cached result
      console.log(`📦 Cache hit for: ${normalizedWord}`);

      // Update access information
      wordDoc.lastAccessed = new Date();
      wordDoc.accessCount += 1;
      await wordDoc.save();

      return res.json({
        word: normalizedWord,
        analysis: wordDoc.analysis,
        type: wordDoc.type,
        fromCache: true,
        accessCount: wordDoc.accessCount,
        likes: wordDoc.likes,
        dislikes: wordDoc.dislikes,
        _id: wordDoc._id,
      });
    }

    // Word not in DB - call ChatGPT API
    console.log(`🤖 Calling ChatGPT for: ${normalizedWord}`);

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error:
          "OpenAI API key not configured. Please add OPENAI_API_KEY to .env file",
      });
    }

    const prompt = PROMPT_TEMPLATE.replace("{word}", normalizedWord);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1", // You can change to "gpt-3.5-turbo" for faster/cheaper responses
      messages: [
        {
          role: "system",
          content: "Si strokovnjak za slovensko besedotvorje in morfologijo.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const analysis = completion.choices[0].message.content.trim();

    // Extract word type from analysis
    const { cleanAnalysis, wordType } = extractWordType(analysis);

    // Save to database
    wordDoc = new Word({
      word: normalizedWord,
      analysis: cleanAnalysis,
      type: wordType || "",
    });

    await wordDoc.save();
    console.log(`💾 Saved to DB: ${normalizedWord}`);

    res.json({
      word: normalizedWord,
      analysis: cleanAnalysis,
      type: wordType,
      fromCache: false,
      accessCount: 1,
      likes: 0,
      dislikes: 0,
      _id: wordDoc._id,
    });
  } catch (error) {
    console.error("Error analyzing word:", error);

    // Handle OpenAI specific errors
    if (error.response) {
      return res.status(error.response.status).json({
        error: "OpenAI API error: " + error.response.data.error.message,
      });
    }

    res.status(500).json({
      error: "Error analyzing word: " + error.message,
    });
  }
};

// Update an existing word's analysis and type
exports.updateWord = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, analysis } = req.body;

    // Validate id
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid word ID" });
    }

    if (!analysis || typeof analysis !== "string" || !analysis.trim()) {
      return res.status(400).json({ error: "Analysis text is required" });
    }

    // Limit size to avoid abuse
    const cleanAnalysis = analysis.trim().slice(0, 10000);
    const cleanType = type ? String(type).trim().slice(0, 200) : "";

    const wordDoc = await Word.findById(id);
    if (!wordDoc) {
      return res.status(404).json({ error: "Word not found" });
    }

    wordDoc.analysis = cleanAnalysis;
    wordDoc.type = cleanType;
    await wordDoc.save();

    // Reset likes/dislikes on manual edit
    wordDoc.likes = 0;
    wordDoc.dislikes = 0;
    wordDoc.votes = [];
    await wordDoc.save();

    res.json({
      success: true,
      _id: wordDoc._id,
      word: wordDoc.word,
      analysis: wordDoc.analysis,
      type: wordDoc.type,
    });
  } catch (error) {
    console.error("Error updating word:", error);
    res.status(500).json({ error: "Error updating word" });
  }
};

// Vote on a word analysis (like, dislike, or remove vote)
exports.voteOnWord = async (req, res) => {
  try {
    const { wordId } = req.params;
    const { voteType } = req.body;

    // Validate wordId format (MongoDB ObjectId)
    if (!wordId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid word ID" });
    }

    // Validate voteType
    if (voteType !== null && voteType !== "like" && voteType !== "dislike") {
      return res.status(400).json({
        error: "Invalid vote type. Must be 'like', 'dislike', or null",
      });
    }

    const word = await Word.findById(wordId);

    if (!word) {
      return res.status(404).json({ error: "Word not found" });
    }

    // Get user's IP address (handle proxies)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      req.ip;

    // Hash IP for privacy
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    // Initialize votes array if it doesn't exist
    if (!word.votes) {
      word.votes = [];
    }

    // Find existing vote from this IP
    const existingVoteIndex = word.votes.findIndex((v) => v.ipHash === ipHash);
    const existingVote =
      existingVoteIndex >= 0 ? word.votes[existingVoteIndex] : null;

    // If user already voted, remove the old vote
    if (existingVote) {
      word.votes.splice(existingVoteIndex, 1);
    }

    // Add new vote if provided (and different from existing)
    if (voteType && voteType !== existingVote?.voteType) {
      word.votes.push({ ipHash, voteType });
    }

    // Recalculate likes and dislikes from votes array
    word.likes = word.votes.filter((v) => v.voteType === "like").length;
    word.dislikes = word.votes.filter((v) => v.voteType === "dislike").length;

    await word.save();

    res.json({
      _id: word._id,
      word: word.word,
      likes: word.likes,
      dislikes: word.dislikes,
      userVote: voteType === existingVote?.voteType ? null : voteType, // Return what vote is now active
    });
  } catch (error) {
    console.error("Error voting on word:", error);
    res.status(500).json({ error: "Error voting on word" });
  }
};

// Get most disliked words sorted by dislike percentage
exports.getMostDisliked = async (req, res) => {
  try {
    // Fetch all words with at least one vote
    const words = await Word.find({
      $expr: { $gt: [{ $add: ["$likes", "$dislikes"] }, 0] },
    }).select("word analysis type likes dislikes");

    // Calculate dislike percentage and sort
    const wordsWithPercentage = words.map((word) => {
      const total = word.likes + word.dislikes;
      const dislikePercentage = total > 0 ? (word.dislikes / total) * 100 : 0;
      return {
        _id: word._id,
        word: word.word,
        analysis: word.analysis,
        type: word.type,
        likes: word.likes,
        dislikes: word.dislikes,
        dislikePercentage: Math.round(dislikePercentage * 10) / 10, // Round to 1 decimal
      };
    });

    // Sort by dislike percentage (descending)
    wordsWithPercentage.sort(
      (a, b) => b.dislikePercentage - a.dislikePercentage,
    );

    res.json(wordsWithPercentage);
  } catch (error) {
    console.error("Error fetching most disliked:", error);
    res.status(500).json({ error: "Error fetching statistics" });
  }
};
