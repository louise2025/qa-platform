const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Import routes
const channelRoutes = require("./routes/channels")
const postRoutes = require("./routes/posts")
const replyRoutes = require("./routes/replies")
const userRoutes = require("./routes/users")
const authRoutes = require("./routes/auth")

// Create Express app
const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
    credentials: true,
  }),
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.use("/api/channels", channelRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/replies", replyRoutes)
app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Programming Q&A API" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

