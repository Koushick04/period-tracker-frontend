const { Pool } = require("pg");

const pool = new Pool({
    user: "perioduser",
    host: "127.0.0.1",
    database: "periodtracker",
    password: "periodpass",
    port: 5433
});

async function test() {
    try {
        console.log("Connecting...");
        const res = await pool.query('SELECT NOW()');
        console.log("Connected:", res.rows[0]);

        console.log("Checking users table...");
        const users = await pool.query('SELECT * FROM users');
        console.log("Users count:", users.rows.length);

        console.log("Attempting insert...");
        const insert = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id", ['test_debug@example.com', 'hash']);
        console.log("Inserted ID:", insert.rows[0].id);

        // cleanup
        await pool.query("DELETE FROM users WHERE id = $1", [insert.rows[0].id]);
        console.log("Cleanup done.");

        process.exit(0);
    } catch (err) {
        console.error("DB ERROR:", err);
        process.exit(1);
    }
}

test();
