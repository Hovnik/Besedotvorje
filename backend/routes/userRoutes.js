const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { loginRateLimiter } = require("../middleware/rateLimiters");

router.post("/login", loginRateLimiter, userController.loginUser);

module.exports = router;
