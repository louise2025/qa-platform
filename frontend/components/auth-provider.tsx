"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

// Create auth context
const AuthContext = createContext({
  user: null,
  isAdmin: false,
  loading: true,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("user")
          const token = localStorage.getItem("authToken")

          if (storedUser && token) {
            // Validate token with the server
            const response = await fetch("http://localhost:4000/api/users/profile", {
              headers: {
                "x-auth-token": token,
              },
            })

            if (response.ok) {
              // Token is valid, set user
              const userData = await response.json()
              setUser({
                id: userData.id,
                username: userData.username,
                displayName: userData.display_name,
                role: userData.role,
              })
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem("user")
              localStorage.removeItem("authToken")
              setUser(null)
            }
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      checkAuth()
    }
  }, [mounted])

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    if (!loading && mounted) {
      const publicRoutes = ["/auth/login", "/auth/register", "/"]
      const isPublicRoute = publicRoutes.includes(pathname)

      if (!user && !isPublicRoute) {
        router.push("/auth/login")
      }

      if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
        router.push("/channels")
      }
    }
  }, [user, loading, pathname, router, mounted])

  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("authToken", token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    setUser(null)
    router.push("/auth/login")
  }

  // Don't render anything on the server
  if (!mounted) {
    return <>{children}</>
  }

  const value = {
    user,
    isAdmin: user?.role === "admin",
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

