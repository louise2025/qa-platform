"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

export default function ChannelList() {
  const [channels, setChannels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, token } = useAuth()

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        // Include the token in the request if available
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const response = await fetch("http://localhost:4000/api/channels", {
          headers,
        })

        if (!response.ok) {
          throw new Error("Failed to fetch channels")
        }

        const data = await response.json()
        setChannels(data)
      } catch (err) {
        setError("Failed to load channels")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannels()
  }, [token])

  if (isLoading) {
    return <div className="p-4">Loading channels...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Channels</h2>

      <div className="space-y-2">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <div key={channel.id} className="p-3 border rounded-lg hover:bg-gray-50">
              <Link href={`/channels/${channel.id}`}>
                <h3 className="font-medium">{channel.name}</h3>
                <p className="text-sm text-gray-500">{channel.description}</p>
              </Link>
            </div>
          ))
        ) : (
          <p>No channels available.</p>
        )}
      </div>
    </div>
  )
}

