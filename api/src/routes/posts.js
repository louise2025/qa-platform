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

// Get all posts for a channel
router.get("/channel/:channelId", async (req, res) => {
  try {
    console.log("Getting posts for channel:", req.params.channelId)

    const [rows] = await db.query(
      `
      SELECT p.*, u.display_name as author, 
             (SELECT COUNT(*) FROM replies WHERE post_id = p.id) as reply_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.channel_id = ?
      ORDER BY p.created_at DESC
      `,
      [req.params.channelId],
    )

    console.log("Found posts:", rows.length)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching posts:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a single post by ID with replies
router.get("/:id", async (req, res) => {
  try {
    // Get post
    const [posts] = await db.query(
      `
      SELECT p.*, u.display_name as author
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
      `,
      [req.params.id],
    )

    if (posts.length === 0) {
      return res.status(404).json({ message: "Post not found" })
    }

    const post = posts[0]

    // Get screenshot if exists
    if (post.screenshot_id) {
      try {
        const screenshot = await screenshots.get(post.screenshot_id)
        post.screenshot = screenshot.data
      } catch (err) {
        console.error("Error fetching screenshot:", err)
        post.screenshot = null
      }
    }

    // Get replies
    const [replies] = await db.query(
      `
      SELECT r.*, u.display_name as author
      FROM replies r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.post_id = ? AND r.parent_reply_id IS NULL
      ORDER BY r.created_at ASC
      `,
      [req.params.id],
    )

    // Get nested replies for each reply
    for (const reply of replies) {
      if (reply.screenshot_id) {
        try {
          const screenshot = await screenshots.get(reply.screenshot_id)
          reply.screenshot = screenshot.data
        } catch (err) {
          console.error("Error fetching reply screenshot:", err)
          reply.screenshot = null
        }
      }

      const [nestedReplies] = await db.query(
        `
        WITH RECURSIVE reply_tree AS (
          SELECT r.*, u.display_name as author, 0 as level
          FROM replies r
          LEFT JOIN users u ON r.user_id = u.id
          WHERE r.parent_reply_id = ?
          
          UNION ALL
          
          SELECT r.*, u.display_name as author, rt.level + 1
          FROM replies r
          JOIN reply_tree rt ON r.parent_reply_id = rt.id
          LEFT JOIN users u ON r.user_id = u.id
        )
        SELECT * FROM reply_tree
        ORDER BY level, created_at ASC
        `,
        [reply.id],
      )

      // Get screenshots for nested replies
      for (const nestedReply of nestedReplies) {
        if (nestedReply.screenshot_id) {
          try {
            const screenshot = await screenshots.get(nestedReply.screenshot_id)
            nestedReply.screenshot = screenshot.data
          } catch (err) {
            console.error("Error fetching nested reply screenshot:", err)
            nestedReply.screenshot = null
          }
        }
      }

      reply.replies = nestedReplies
    }

    post.replies = replies

    res.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new post - REMOVED AUTH MIDDLEWARE FOR TESTING
router.post("/", upload.single("screenshot"), async (req, res) => {
  const { title, content, channelId } = req.body

  if (!title || !content || !channelId) {
    return res.status(400).json({ message: "Title, content, and channelId are required" })
  }

  try {
    console.log("Creating post:", { title, channelId })

    let screenshotId = null

    // Upload screenshot to CouchDB if provided
    if (req.file) {
      const response = await screenshots.insert({
        data: req.file.buffer.toString("base64"),
        contentType: req.file.mimetype,
      })
      screenshotId = response.id
    }

    // Insert post into MySQL
    const [result] = await db.query(
      "INSERT INTO posts (channel_id, user_id, title, content, screenshot_id) VALUES (?, ?, ?, ?, ?)",
      [channelId, 1, title, content, screenshotId], // Using user ID 1 (admin) as the default author
    )

    const [newPost] = await db.query(
      `
      SELECT p.*, u.display_name as author
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
      `,
      [result.insertId],
    )

    res.status(201).json(newPost[0])
  } catch (error) {
    console.error("Error creating post:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a post - REMOVED AUTH MIDDLEWARE FOR TESTING
router.delete("/:id", async (req, res) => {
  try {
    // Get post to check ownership
    const [posts] = await db.query("SELECT * FROM posts WHERE id = ?", [req.params.id])

    if (posts.length === 0) {
      return res.status(404).json({ message: "Post not found" })
    }

    const post = posts[0]

    // Delete screenshot from CouchDB if exists
    if (post.screenshot_id) {
      try {
        const screenshot = await screenshots.get(post.screenshot_id)
        await screenshots.destroy(post.screenshot_id, screenshot._rev)
      } catch (err) {
        console.error("Error deleting screenshot:", err)
      }
    }

    // Delete post from MySQL
    await db.query("DELETE FROM posts WHERE id = ?", [req.params.id])

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

