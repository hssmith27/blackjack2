const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.post("/login", (req, res) => {
  console.log("Received login data:", req.body);
  res.json({ success: true, message: "Login received" });
});

app.listen(PORT, () => {
  console.log('Backend server running on http://localhost:${PORT}');
});