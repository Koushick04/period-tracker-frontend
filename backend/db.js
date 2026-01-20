const { Pool } = require("pg");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Required for some cloud providers like Render/Heroku
      }
    }
    : {
      user: "perioduser",
      host: "localhost",
      database: "periodtracker",
      password: "periodpass",
      port: 5433
    }
);

module.exports = pool;
