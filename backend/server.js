const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Set security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for now to allow inline scripts
  }),
);

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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
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
const userRoutes = require("./routes/userRoutes");

// Pass rate limiters to routes
app.use("/api/words", wordRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  const healthCheck = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    openai: process.env.OPENAI_API_KEY ? "configured" : "missing",
  };

  const httpStatus = healthCheck.mongodb === "connected" ? 200 : 503;
  res.status(httpStatus).json(healthCheck);
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from the frontend build
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Handle React routing - serve index.html for all routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  // Log error details
  console.error("Error:", err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error("Stack:", err.stack);
  }

  // Handle specific error types
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "CORS policy: Origin not allowed",
      origin: req.headers.origin,
    });
  }

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
