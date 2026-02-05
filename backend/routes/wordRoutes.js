const express = require("express");
const router = express.Router();
const wordController = require("../controllers/wordController");
const {
  analyzeRateLimiter,
  voteRateLimiter,
} = require("../middleware/rateLimiters");

// Analyze word - check DB first, then ChatGPT if needed (with stricter rate limit)
router.post("/analyze", analyzeRateLimiter, wordController.analyzeWord);

// Get most disliked words by percentage
router.get("/stats/most-disliked", wordController.getMostDisliked);

// Update an existing word analysis
router.put("/:id", wordController.updateWord);

// Vote on a word (like/dislike/remove) (with rate limit)
router.post("/:wordId/vote", voteRateLimiter, wordController.voteOnWord);

module.exports = router;
