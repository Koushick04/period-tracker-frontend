const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { Pool } = require("pg");
const fs = require("fs");

const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: false
};

// Parse connection string to get credentials but connect to 'postgres' default DB
const url = new URL(process.env.DATABASE_URL);
const postgresUrl = `postgresql://${url.username}:${url.password}@${url.hostname}:${url.port}/postgres`;

async function setup() {
    console.log("🛠️ Starting Database Setup...");

    // Step 1: Create Database if not exists
    const rootPool = new Pool({ connectionString: postgresUrl });
    try {
        const client = await rootPool.connect();
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'periodtracker'");
        if (res.rowCount === 0) {
            console.log("Creating database 'periodtracker'...");
            await client.query("CREATE DATABASE periodtracker");
        } else {
            console.log("Database 'periodtracker' already exists.");
        }
        client.release();
    } catch (err) {
        console.error("Setup Error (Step 1):", err.message);
        console.log("\n⚠️ TIP: Your password in .env might still be wrong if this failed.");
        process.exit(1);
    } finally {
        await rootPool.end();
    }

    // Step 2: Create Tables (Schema)
    console.log("Applying Schema...");
    const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const schemaSql = fs.readFileSync(path.join(__dirname, "../schema.sql"), "utf8");
        await dbPool.query(schemaSql);
        console.log("✅ Tables Created (schema.sql)");

        // Step 3: Apply Migrations (if any)
        try {
            const migrationSql = fs.readFileSync(path.join(__dirname, "../migration.sql"), "utf8");
            await dbPool.query(migrationSql);
            console.log("✅ Migrations Applied (migration.sql)");
        } catch (migErr) {
            console.log("Info: Migration might have already run or file missing.");
        }

    } catch (err) {
        console.error("Setup Error (Step 2):", err.message);
    } finally {
        await dbPool.end();
    }

    console.log("\n✅ DONE! You can now start the server with: node server.js");
}

setup();
