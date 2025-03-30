const express = require("express")
const router = express.Router()
const multer = require("multer")
const db = require("../config/db")
const { screenshots } = require("../config/couchdb")
const auth = require("../middleware/auth")

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

// Create a new reply - REMOVED AUTH MIDDLEWARE FOR TESTING
router.post("/", upload.single("screenshot"), async (req, res) => {
  const { postId, content, parentReplyId } = req.body

  if (!postId || !content) {
    return res.status(400).json({ message: "Post ID and content are required" })
  }

  try {
    console.log("Creating reply for post:", postId)

    let screenshotId = null

    // Upload screenshot to CouchDB if provided
    if (req.file) {
      const response = await screenshots.insert({
        data: req.file.buffer.toString("base64"),
        contentType: req.file.mimetype,
      })
      screenshotId = response.id
    }

    // Insert reply into MySQL
    const [result] = await db.query(
      "INSERT INTO replies (post_id, user_id, parent_reply_id, content, screenshot_id) VALUES (?, ?, ?, ?, ?)",
      [postId, 1, parentReplyId || null, content, screenshotId], // Using user ID 1 (admin) as default author
    )

    const [newReply] = await db.query(
      `
      SELECT r.*, u.display_name as author
      FROM replies r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
      `,
      [result.insertId],
    )

    res.status(201).json(newReply[0])
  } catch (error) {
    console.error("Error creating reply:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a reply - REMOVED AUTH MIDDLEWARE FOR TESTING
router.delete("/:id", async (req, res) => {
  try {
    // Get reply to check ownership
    const [replies] = await db.query("SELECT * FROM replies WHERE id = ?", [req.params.id])

    if (replies.length === 0) {
      return res.status(404).json({ message: "Reply not found" })
    }

    const reply = replies[0]

    // Delete screenshot from CouchDB if exists
    if (reply.screenshot_id) {
      try {
        const screenshot = await screenshots.get(reply.screenshot_id)
        await screenshots.destroy(reply.screenshot_id, screenshot._rev)
      } catch (err) {
        console.error("Error deleting screenshot:", err)
      }
    }

    // Delete reply from MySQL
    await db.query("DELETE FROM replies WHERE id = ?", [req.params.id])

    res.json({ message: "Reply deleted successfully" })
  } catch (error) {
    console.error("Error deleting reply:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

