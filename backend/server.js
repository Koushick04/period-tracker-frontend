const express = require("express");
const cors = require("cors");

const authRoutes = require("./authRoutes");
const periodRoutes = require("./periodRoutes");

const app = express();

// Use env var for Frontend URL if needed, or * for public access
app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/periods", periodRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
