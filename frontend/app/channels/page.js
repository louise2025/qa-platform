"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function ChannelsPage() {
  const [channels, setChannels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/channels")

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setChannels(data)
      } catch (err) {
        console.error("Error fetching channels:", err)
        setError(err.message || "Failed to load channels")
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannels()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Channels</h1>
        <div className="p-4 text-center">Loading channels...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Channels</h1>
        <div className="p-4 bg-red-100 text-red-700 rounded">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Channels</h1>

      {channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              href={`/channels/${channel.id}`}
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold">{channel.name}</h2>
              <p className="text-gray-600">{channel.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                {channel.post_count} {channel.post_count === 1 ? "post" : "posts"}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center bg-gray-50 rounded-lg">No channels available.</div>
      )}
    </div>
  )
}

