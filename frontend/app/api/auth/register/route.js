import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Simple in-memory user store for demonstration
// In a real app, you would use your database
const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user", password: "user123", role: "user" },
]

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    // Check if username already exists
    if (users.some((u) => u.username === username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      password,
      role: "user", // Default role
    }

    // Add to users array (in a real app, save to database)
    users.push(newUser)

    // Create token
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" },
    )

    // Return user info and token
    return NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

