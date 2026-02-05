const rateLimit = require("express-rate-limit");

// Stricter rate limiting for word analysis (uses ChatGPT API)
const analyzeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 analysis requests per minute
  message: "Too many analysis requests, please try again in a minute.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for voting to prevent spam
const voteRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 votes per minute
  message: "Too many vote requests, please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  analyzeRateLimiter,
  voteRateLimiter,
};
