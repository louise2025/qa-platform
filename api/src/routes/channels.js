const express = require("express")
const router = express.Router()
const db = require("../config/db")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

// Get all channels - public access
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
    SELECT c.*, COUNT(p.id) as post_count
    FROM channels c
    LEFT JOIN posts p ON c.id = p.channel_id
    GROUP BY c.id
    ORDER BY c.name
    `,
    )
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a single channel by ID - public access
router.get("/:id", async (req, res) => {
  try {
    console.log("Getting channel with ID:", req.params.id)

    const [rows] = await db.query(
      `
    SELECT c.*, COUNT(p.id) as post_count
    FROM channels c
    LEFT JOIN posts p ON c.id = p.channel_id
    WHERE c.id = ?
    GROUP BY c.id
    `,
      [req.params.id],
    )

    console.log("Query result:", rows)

    if (rows.length === 0) {
      return res.status(404).json({ message: "Channel not found" })
    }

    res.json(rows[0])
  } catch (error) {
    console.error("Error fetching channel:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new channel - requires authentication
router.post("/", auth, async (req, res) => {
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ message: "Channel name is required" })
  }

  try {
    console.log("Creating channel:", { name, description })

    // Insert the new channel
    const [result] = await db.query(
      "INSERT INTO channels (name, description, created_by) VALUES (?, ?, ?)",
      [name, description, req.user.id], // Use the authenticated user's ID
    )

    console.log("Channel created with ID:", result.insertId)

    // Get the newly created channel
    const [newChannel] = await db.query("SELECT * FROM channels WHERE id = ?", [result.insertId])

    // Add post_count of 0 for new channel
    if (newChannel.length > 0) {
      newChannel[0].post_count = 0
    }

    res.status(201).json(newChannel[0])
  } catch (error) {
    console.error("Error creating channel:", error)

    // Check for duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Channel name already exists" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// Update a channel - requires authentication
router.put("/:id", auth, async (req, res) => {
  const { name, description } = req.body
  const channelId = req.params.id

  if (!name) {
    return res.status(400).json({ message: "Channel name is required" })
  }

  try {
    // Check if channel exists
    const [channels] = await db.query("SELECT * FROM channels WHERE id = ?", [channelId])

    if (channels.length === 0) {
      return res.status(404).json({ message: "Channel not found" })
    }

    // Check if user is admin or the creator of the channel
    if (req.user.role !== "admin" && channels[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this channel" })
    }

    // Update the channel
    await db.query("UPDATE channels SET name = ?, description = ? WHERE id = ?", [name, description, channelId])

    // Get the updated channel
    const [updatedChannel] = await db.query(
      `
    SELECT c.*, COUNT(p.id) as post_count
    FROM channels c
    LEFT JOIN posts p ON c.id = p.channel_id
    WHERE c.id = ?
    GROUP BY c.id
    `,
      [channelId],
    )

    res.json(updatedChannel[0])
  } catch (error) {
    console.error(error)

    // Check for duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Channel name already exists" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// Delete a channel - requires authentication
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if channel exists
    const [channels] = await db.query("SELECT * FROM channels WHERE id = ?", [req.params.id])

    if (channels.length === 0) {
      return res.status(404).json({ message: "Channel not found" })
    }

    // Check if user is admin or the creator of the channel
    if (req.user.role !== "admin" && channels[0].created_by !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this channel" })
    }

    const [result] = await db.query("DELETE FROM channels WHERE id = ?", [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Channel not found" })
    }

    res.json({ message: "Channel deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete all channels - admin only
router.delete("/all", adminAuth, async (req, res) => {
  try {
    // Delete all channels (this will cascade delete all posts and replies due to foreign key constraints)
    await db.query("DELETE FROM channels")

    res.json({ message: "All channels deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

