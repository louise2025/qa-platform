const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const db = require("../config/db")

// Register a new user
router.post("/register", async (req, res) => {
  const { username, password, displayName } = req.body

  if (!username || !password || !displayName) {
    return res.status(400).json({ message: "Username, password, and display name are required" })
  }

  try {
    // Check if username already exists
    const [existingUsers] = await db.query("SELECT * FROM users WHERE username = ?", [username])

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Username already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert user
    const [result] = await db.query("INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)", [
      username,
      hashedPassword,
      displayName,
    ])

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, username, role: "user" },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" },
    )

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        username,
        displayName,
        role: "user",
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" })
  }

  try {
    // Find user
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username])

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const user = users[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" },
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

