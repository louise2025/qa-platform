"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors by only rendering user-dependent UI after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <nav className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Programming Q&A
          </Link>
          <div className="h-8"></div> {/* Placeholder for auth buttons */}
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Programming Q&A
        </Link>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Signed in as <strong>{user.username}</strong>
              </span>

              {user.role === "admin" && (
                <Link href="/admin" className="text-blue-600 hover:underline">
                  Admin
                </Link>
              )}

              <button onClick={logout} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <Link href="/auth/login" className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
                Login
              </Link>
              <Link href="/auth/register" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

