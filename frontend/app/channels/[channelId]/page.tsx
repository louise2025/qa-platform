"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Plus, MessageSquare, User, Calendar } from "lucide-react"
import CreatePostDialog from "@/components/create-post-dialog"
import { formatDistanceToNow } from "date-fns"
import { Providers } from "@/app/providers"

export default function ChannelPage() {
  return (
    <Providers>
      <ChannelContent />
    </Providers>
  )
}

function ChannelContent() {
  const params = useParams()
  const channelId = params.channelId

  const [channel, setChannel] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Fetch channel and posts
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching channel with ID:", channelId)
        const token = localStorage.getItem("authToken")

        // Fetch channel details
        const channelResponse = await fetch(`http://localhost:4000/api/channels/${channelId}`, {
          headers: {
            "x-auth-token": token || "",
          },
        })
        console.log("Channel response status:", channelResponse.status)

        if (!channelResponse.ok) {
          const errorText = await channelResponse.text()
          console.error("Error fetching channel:", errorText)
          setError("Channel not found")
          setLoading(false)
          return
        }

        const channelData = await channelResponse.json()
        console.log("Channel data:", channelData)
        setChannel(channelData)

        // Fetch posts for this channel
        try {
          const postsResponse = await fetch(`http://localhost:4000/api/posts/channel/${channelId}`, {
            headers: {
              "x-auth-token": token || "",
            },
          })
          if (postsResponse.ok) {
            const postsData = await postsResponse.json()
            console.log("Posts data:", postsData)
            setPosts(postsData)
          } else {
            console.log("No posts found or error fetching posts")
            setPosts([])
          }
        } catch (postsError) {
          console.error("Error fetching posts:", postsError)
          setPosts([])
        }
      } catch (error) {
        console.error("Error fetching channel data:", error)
        setError("Error loading channel")
      } finally {
        setLoading(false)
      }
    }

    if (channelId) {
      fetchChannelData()
    }
  }, [channelId])

  const handleCreatePost = async (newPost) => {
    try {
      const token = localStorage.getItem("authToken")
      // Make an API call to create a new post
      const formData = new FormData()
      formData.append("title", newPost.title)
      formData.append("content", newPost.content)
      formData.append("channelId", channelId)

      if (newPost.screenshot) {
        // Convert base64 to blob
        const response = await fetch(newPost.screenshot)
        const blob = await response.blob()
        formData.append("screenshot", blob)
      }

      const response = await fetch("http://localhost:4000/api/posts", {
        method: "POST",
        headers: {
          "x-auth-token": token || "",
        },
        body: formData,
      })

      if (response.ok) {
        const createdPost = await response.json()
        setPosts([createdPost, ...posts])
      }
    } catch (error) {
      console.error("Error creating post:", error)
    }

    setIsCreateDialogOpen(false)
  }

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading channel...</div>
  }

  if (error || !channel) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Channel not found</h2>
        <p className="text-gray-600 mb-4">The channel you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <a href="/channels">Back to Channels</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{channel.name}</h1>
          <p className="text-gray-600 mt-2">{channel.description}</p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts in this channel yet. Be the first to post!</p>
          <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Post
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">
                  <a href={`/channels/${channelId}/posts/${post.id}`} className="hover:text-primary">
                    {post.title}
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-gray-500 pt-2 border-t">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{post.reply_count || 0} replies</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreatePostDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreatePost={handleCreatePost}
      />
    </div>
  )
}

