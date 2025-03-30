"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreatePostDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreatePost: (post: { title: string; content: string; screenshot: string | null }) => void
}

export default function CreatePostDialog({ isOpen, onClose, onCreatePost }: CreatePostDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [screenshot, setScreenshot] = useState(null)
  const [titleError, setTitleError] = useState("")
  const [contentError, setContentError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate
    let hasError = false

    if (!title.trim()) {
      setTitleError("Title is required")
      hasError = true
    }

    if (!content.trim()) {
      setContentError("Content is required")
      hasError = true
    }

    if (hasError) return

    onCreatePost({ title, content, screenshot })

    // Reset form
    setTitle("")
    setContent("")
    setScreenshot(null)
    setTitleError("")
    setContentError("")
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>Ask a question or start a discussion about a programming topic.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="required">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setTitleError("")
                }}
                placeholder="e.g., How to implement async/await in JavaScript?"
              />
              {titleError && <p className="text-sm text-red-500">{titleError}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content" className="required">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  setContentError("")
                }}
                placeholder="Describe your question or issue in detail..."
                rows={5}
              />
              {contentError && <p className="text-sm text-red-500">{contentError}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="screenshot">Screenshot (optional)</Label>
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
              <div>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Post</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

