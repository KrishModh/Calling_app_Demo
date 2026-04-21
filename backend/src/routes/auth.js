import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

function getEnvUsers() {
  return [
    { email: process.env.USER1_EMAIL, password: process.env.USER1_PASSWORD },
    { email: process.env.USER2_EMAIL, password: process.env.USER2_PASSWORD }
  ].filter((u) => u.email && u.password);
}

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const matched = getEnvUsers().find(
    (u) => u.email === email && u.password === password
  );

  if (!matched) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ email: matched.email }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  return res.json({ token, email: matched.email });
});

export function getPeerEmail(currentEmail) {
  const users = getEnvUsers().map((u) => u.email);
  return users.find((email) => email !== currentEmail) || null;
}

export default router;
