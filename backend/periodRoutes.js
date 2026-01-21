const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("./db");

const SECRET = "supersecretkey"; // Matches authRoutes.js

function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// GET periods (PER USER, NORMALIZED DATE)
router.get("/", auth, async (req, res) => {
  const result = await db.query(
    `
    SELECT 
      TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date
    FROM periods
    WHERE user_id = $1
    ORDER BY start_date
    `,
    [req.userId]
  );

  res.json(result.rows);
});


// ADD period
router.post("/", auth, async (req, res) => {
  const { date } = req.body;

  await db.query(
    `
    INSERT INTO periods (user_id, start_date)
    VALUES ($1, $2::date)
    ON CONFLICT DO NOTHING
    `,
    [req.userId, date]
  );

  res.json({ success: true });
});


// DELETE period
router.delete("/", auth, async (req, res) => {
  const { date } = req.body;
  await db.query(
    "DELETE FROM periods WHERE user_id=$1 AND start_date=$2",
    [req.userId, date]
  );
  res.json({ success: true });
});

// DELETE ALL periods
router.delete("/all", auth, async (req, res) => {
  await db.query("DELETE FROM periods WHERE user_id=$1", [req.userId]);
  res.json({ success: true });
});

module.exports = router;
