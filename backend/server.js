const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
console.log("DEBUG: Active DATABASE_URL is:", process.env.DATABASE_URL);
const cors = require("cors");

const authRoutes = require("./authRoutes");
const periodRoutes = require("./periodRoutes");

const app = express();

// Use env var for Frontend URL if needed, or * for public access
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://period-tracker-lake-five.vercel.app"
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check for allowed origins or Vercel preview URLs
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/periods", periodRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
