const { Pool } = require("pg");

const commonPasswords = [
    "postgres",
    "password",
    "admin",
    "123456",
    "1234",
    "root",
    "periodtracker",
    "" // empty string
];

async function checkPassword(password) {
    const pool = new Pool({
        user: "postgres",
        host: "localhost",
        database: "periodtracker",
        password: password,
        port: 5432
    });

    try {
        const client = await pool.connect();
        console.log(`\n✅ FOUND IT! Your password is: "${password}"`);
        console.log("Updating .env file automatically...");

        const fs = require('fs');
        const envContent = `DATABASE_URL=postgresql://postgres:${password}@localhost:5432/periodtracker\nPORT=5000\nJWT_SECRET=supersecretkey`;
        fs.writeFileSync('.env', envContent);
        console.log("✅ backend/.env file updated!");

        client.release();
        await pool.end();
        return true;
    } catch (err) {
        await pool.end();
        return false;
    }
}

async function run() {
    console.log("🔍 Trying to find your database password...");

    for (const pass of commonPasswords) {
        process.stdout.write(`Testing "${pass}"... `);
        const success = await checkPassword(pass);
        if (success) {
            process.exit(0);
        } else {
            console.log("❌ No");
        }
    }

    console.log("\n❌ Could not find the password in common list.");
    console.log("You will need to reset your PostgreSQL password manually.");
    process.exit(1);
}

run();
