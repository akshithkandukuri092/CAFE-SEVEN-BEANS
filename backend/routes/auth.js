const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (db) => {
  const router = express.Router();

  // REGISTER
  router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Registered" });
      }
    );
  });

  // LOGIN
  router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(401).json({ error: "User not found" });

      const user = result[0];

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Wrong password" });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        "secret123"
      );

      res.json({ token, user });
    });
  });

  return router;
};