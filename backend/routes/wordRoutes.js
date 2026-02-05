const express = require("express");
const router = express.Router();
const wordController = require("../controllers/wordController");
const {
  analyzeRateLimiter,
  voteRateLimiter,
} = require("../middleware/rateLimiters");

// Analyze word - check DB first, then ChatGPT if needed (with stricter rate limit)
router.post("/analyze", analyzeRateLimiter, wordController.analyzeWord);

// Get all analyzed words
router.get("/history", wordController.getHistory);

// Vote on a word (like/dislike/remove) (with rate limit)
router.post("/:wordId/vote", voteRateLimiter, wordController.voteOnWord);

module.exports = router;
