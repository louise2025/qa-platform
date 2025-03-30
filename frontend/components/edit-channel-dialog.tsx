"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EditChannelDialogProps {
  isOpen: boolean
  onClose: () => void
  onEditChannel: (channel: { id: number; name: string; description: string }) => void
  channel: { id: number; name: string; description: string } | null
}

export default function EditChannelDialog({ isOpen, onClose, onEditChannel, channel }: EditChannelDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [nameError, setNameError] = useState("")

  // Update form when channel changes
  useEffect(() => {
    if (channel) {
      setName(channel.name)
      setDescription(channel.description || "")
    }
  }, [channel])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate
    if (!name.trim()) {
      setNameError("Channel name is required")
      return
    }

    if (channel) {
      onEditChannel({ id: channel.id, name, description })
    }

    // Reset form
    setNameError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>Update the channel name or description.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="required">
                Channel Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError("")
                }}
                placeholder="e.g., JavaScript, React, Python"
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this channel is about..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

