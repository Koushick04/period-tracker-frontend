app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const express = require("express");
const cors = require("cors");
require("dotenv").config(); // ✅ Render-compatible

const authRoutes = require("./authRoutes");
const periodRoutes = require("./periodRoutes");

const app = express();

/**
 * CORS Configuration
 * - Allows localhost (dev)
 * - Allows Vercel production & preview URLs
 */
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://period-tracker-lake-five.vercel.app"
    ];

    // Allow server-to-server, Postman, curl, etc.
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/periods", periodRoutes);

// ✅ Health check (VERY IMPORTANT)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
