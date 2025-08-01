const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db");

const app = express();
const PORT = 3001;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

        if (rows.length > 0) {
            res.json({ success: true, chipCount: rows[0].chip_count });
        } 
        else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } 
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing email or password" });
    }
    try {
        const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        await pool.query("INSERT INTO users (email, password, chip_count) VALUES (?, ?, ?)", [email, password, 1000]);

        res.status(201).json({ success: true, message: "User registered successfully" });
    } 
    catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});