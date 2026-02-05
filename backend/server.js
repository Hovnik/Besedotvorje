const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Set security headers
app.use(helmet());

// Security: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use("/api/", limiter);

// Middleware - CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" })); // Limit body size to prevent large payload attacks

// Security: Prevent NoSQL injection
app.use(mongoSanitize());

// Security: Prevent parameter pollution
app.use((req, res, next) => {
  // Remove any duplicate or suspicious parameters
  if (req.body && typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      if (Array.isArray(req.body[key])) {
        req.body[key] = req.body[key][0]; // Take only first value
      }
    });
  }
  next();
});

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/besedotvorje";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Routes
const wordRoutes = require("./routes/wordRoutes");

// Pass rate limiters to routes
app.use("/api/words", wordRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    openai: process.env.OPENAI_API_KEY ? "configured" : "missing",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Don't leak error details in production
  const errorMessage =
    process.env.NODE_ENV === "production" ? "An error occurred" : err.message;

  res.status(err.status || 500).json({
    error: errorMessage,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
