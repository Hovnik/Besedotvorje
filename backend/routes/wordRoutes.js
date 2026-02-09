const express = require("express");
const router = express.Router();
const wordController = require("../controllers/wordController");
const {
  analyzeRateLimiter,
  voteRateLimiter,
} = require("../middleware/rateLimiters");

// Analyze word - check DB first, then AI if needed (with stricter rate limit)
router.post("/analyze", analyzeRateLimiter, wordController.analyzeWord);

// Update an existing word analysis
router.put("/:id", wordController.updateWord);

// Vote on a word (like/dislike)
router.post("/:wordId/vote", voteRateLimiter, wordController.voteOnWord);

// Get unverified words (paginated)
router.get("/unverified", wordController.getUnverifiedWords);

// Get verified words (paginated)
router.get("/verified", wordController.getVerifiedWords);

// Get most unliked words (paginated)
router.get("/most-unliked", wordController.getMostUnlikedWords);

// Get verified words count
router.get("/verified/count", wordController.getVerifiedWordsCount);

// Mark a word as verified
router.post("/:id/verify", wordController.verifyWord);

module.exports = router;
