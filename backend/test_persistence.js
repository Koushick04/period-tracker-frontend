const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
    user: "perioduser",
    host: "127.0.0.1",
    database: "periodtracker",
    password: "periodpass",
    port: 5433
});

async function testPersistence() {
    try {
        console.log("1. Creating Test User...");
        // Cleanup first
        await pool.query("DELETE FROM users WHERE email = 'test_persistence@example.com'");

        const res = await axios.post('http://localhost:5000/api/auth/register', {
            email: 'test_persistence@example.com',
            password: 'password123'
        });
        const token = res.data.token;
        console.log("User registered. Token obtained.");

        console.log("2. Adding Period Date...");
        const date = '2023-10-25';
        await axios.post('http://localhost:5000/api/periods', { date }, {
            headers: { Authorization: token }
        });
        console.log("Date added via API.");

        console.log("3. Fetching Period Dates...");
        const getRes = await axios.get('http://localhost:5000/api/periods', {
            headers: { Authorization: token }
        });

        const dates = getRes.data.map(d => d.start_date);
        console.log("Fetched dates:", dates);

        if (dates.some(d => d.startsWith(date))) {
            console.log("SUCCESS: Date persisted!");
        } else {
            console.error("FAILURE: Date not found in fetch response.");
        }

    } catch (err) {
        console.error("TEST FAILED:", err.response ? err.response.data : err.message);
    } finally {
        await pool.end();
    }
}

testPersistence();
