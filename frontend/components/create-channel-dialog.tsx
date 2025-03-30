"use client"

import { useState } from "react"
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

interface CreateChannelDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateChannel: (channel: { name: string; description: string }) => void
}

export default function CreateChannelDialog({ isOpen, onClose, onCreateChannel }: CreateChannelDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [nameError, setNameError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate
    if (!name.trim()) {
      setNameError("Channel name is required")
      return
    }

    onCreateChannel({ name, description })

    // Reset form
    setName("")
    setDescription("")
    setNameError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
            <DialogDescription>Create a new channel for discussing specific programming topics.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="required">
                Channel Name
              </Label>
              <Input
                id="name"
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
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
            <Button type="submit">Create Channel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

