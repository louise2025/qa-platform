"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { User, Calendar, Upload, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Providers } from "@/app/providers"

export default function PostPage() {
  return (
    <Providers>
      <PostContent />
    </Providers>
  )
}

function PostContent() {
  const params = useParams()
  const channelId = params.channelId
  const postId = params.postId

  const [post, setPost] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newReply, setNewReply] = useState("")
  const [screenshot, setScreenshot] = useState(null)

  // Fetch post and replies
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching post with ID:", postId)
        const token = localStorage.getItem("authToken")

        // Fetch post details with replies
        const response = await fetch(`http://localhost:4000/api/posts/${postId}`, {
          headers: {
            "x-auth-token": token || "",
          },
        })
        console.log("Post response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error fetching post:", errorText)
          setError("Post not found")
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log("Post data:", data)
        setPost(data)
        setReplies(data.replies || [])
      } catch (error) {
        console.error("Error fetching post data:", error)
        setError("Error loading post")
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPostData()
    }
  }, [postId])

  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!newReply.trim()) return

    try {
      const token = localStorage.getItem("authToken")
      // Make an API call to create a new reply
      const formData = new FormData()
      formData.append("content", newReply)
      formData.append("postId", postId)

      if (screenshot) {
        // Convert base64 to blob
        const response = await fetch(screenshot)
        const blob = await response.blob()
        formData.append("screenshot", blob)
      }

      const response = await fetch("http://localhost:4000/api/replies", {
        method: "POST",
        headers: {
          "x-auth-token": token || "",
        },
        body: formData,
      })

      if (response.ok) {
        const createdReply = await response.json()
        setReplies([...replies, createdReply])
        setNewReply("")
        setScreenshot(null)
      } else {
        console.error("Failed to create reply:", await response.text())
      }
    } catch (error) {
      console.error("Error creating reply:", error)
    }
  }

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshot(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading post...</div>
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <p className="text-gray-600 mb-4">The post you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href={`/channels/${channelId}`}>Back to Channel</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href={`/channels/${channelId}`} className="text-primary hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to channel
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <User className="h-4 w-4 mr-1" />
            <span className="mr-4">{post.author || "Anonymous"}</span>
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {post.content.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {post.screenshot && (
            <div className="mt-4">
              <img
                src={`data:image/jpeg;base64,${post.screenshot}`}
                alt="Post screenshot"
                className="max-w-full h-auto rounded-md border border-gray-200"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">
        {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
      </h2>

      {replies.map((reply) => (
        <Card key={reply.id} className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <User className="h-4 w-4 mr-1" />
              <span className="mr-4">{reply.author || "Anonymous"}</span>
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}</span>
            </div>
            <div className="prose max-w-none">
              {reply.content.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            {reply.screenshot && (
              <div className="mt-4">
                <img
                  src={`data:image/jpeg;base64,${reply.screenshot}`}
                  alt="Reply screenshot"
                  className="max-w-full h-auto rounded-md border border-gray-200"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Add a Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReplySubmit}>
            <Textarea
              placeholder="Write your reply here..."
              className="min-h-[150px] mb-4"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              required
            />

            <div className="mb-4">
              <Label htmlFor="screenshot" className="block mb-2">
                Add Screenshot (optional)
              </Label>
              <div className="flex items-center">
                <Label
                  htmlFor="screenshot"
                  className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Label>
                <input
                  type="file"
                  id="screenshot"
                  className="hidden"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                />
                {screenshot && <span className="ml-4 text-sm text-green-600">Image selected</span>}
              </div>
            </div>

            {screenshot && (
              <div className="mb-4">
                <img
                  src={screenshot || "/placeholder.svg"}
                  alt="Screenshot preview"
                  className="max-w-xs h-auto rounded-md border border-gray-200"
                />
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setScreenshot(null)}>
                  Remove
                </Button>
              </div>
            )}

            <Button type="submit">Post Reply</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

