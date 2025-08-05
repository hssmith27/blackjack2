const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db");
const bcrypt = require ("bcrypt");

const app = express();
const PORT = 3001;
const saltRounds = 10;

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
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length > 0 && await bcrypt.compare(password, rows[0].password)) {
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

    // Make sure user has input email and password
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing email or password" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        await pool.query("INSERT INTO users (email, password, chip_count) VALUES (?, ?, ?)", [email, hashedPassword, 1000]);

        res.status(201).json({ success: true, message: "User registered successfully" });
    } 
    catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get("/get-chip-count/:email", async (req, res) => {
    const { email } = req.params;

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length > 0) {
            res.json({ success: true, chipCount: rows[0].chip_count });
        }
        else {
            res.json({ success: false, message: "User not found" });
        }
    }
    catch (err) {
        console.error("Error fetching chip count:", err);
        res.status(500).json({ success: false, err });
    }
});

app.post("/update-chip-count", async (req, res) => {
    const { email, chipChange } = req.body;

    try {
        await pool.query("UPDATE users SET chip_count = chip_count + ? where email = ?", [chipChange, email]);

        const [rows] = await pool.query("SELECT chip_count FROM users where email = ?", [email]);

        res.json({ success: true, chipCount: rows[0].chip_count });
    }
    catch (err) {
        console.error("Error updating chip count:", err);
        res.status(500).json({ success: false, err });
    }
});