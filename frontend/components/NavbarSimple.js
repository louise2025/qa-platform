"use client"

import Link from "next/link"

// A simplified navbar that doesn't require authentication
export default function NavbarSimple() {
  return (
    <nav className="bg-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Programming Q&A
        </Link>

        <div className="space-x-2">
          <Link href="/auth/login" className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">
            Login
          </Link>
          <Link href="/auth/register" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            Register
          </Link>
        </div>
      </div>
    </nav>
  )
}

