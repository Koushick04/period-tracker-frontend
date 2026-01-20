const { Pool } = require("pg");

const dbConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
  }
  : {
    user: "postgres",
    host: "localhost",
    database: "periodtracker",
    password: "password", // Common default, user might need to change
    port: 5432
  };

console.log("DB Config:", process.env.DATABASE_URL ? "Using connection string" : "Using local defaults (Env not loaded?)");

const pool = new Pool(dbConfig);

module.exports = pool;
