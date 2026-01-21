require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
});

console.log("\n--- DEBUGGING DATABASE CONNECTION ---");
console.log("Trying to connect to:", process.env.DATABASE_URL);

pool.connect()
    .then(client => {
        console.log("✅ SUCCESS! Connected to database.");
        client.release();
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ FAILED to connect!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.message.includes("password authentication failed")) {
            console.log("\n>>> SOLUTION: The password in 'backend/.env' is WRONG.");
            console.log(">>> Please edit backend/.env and put your real PostgreSQL password.");
        }
        process.exit(1);
    });
