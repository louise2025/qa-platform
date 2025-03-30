const express = require("express")
const router = express.Router()
const db = require("../config/db")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, username, display_name, avatar_url, role FROM users WHERE id = ?", [
      req.user.id,
    ])

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(users[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all users (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, username, display_name, avatar_url, role, created_at FROM users")
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a user (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found or cannot delete admin" })
    }

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

