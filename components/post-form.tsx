"use client"

import { useState, useTransition } from "react"
import { createPost } from "@/app/actions"

interface PostFormProps {
  onSuccess?: () => void
}

export function PostForm({ onSuccess }: PostFormProps) {
  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    startTransition(async () => {
      await createPost(content.trim(), authorName.trim() || "Anonymous")
      setContent("")
      setAuthorName("")
      onSuccess?.()
    })
  }

  const remaining = 300 - content.length
  const isNearLimit = remaining <= 50

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary text-sm font-semibold">
            {authorName.charAt(0).toUpperCase() || "A"}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={50}
            className="w-full px-0 py-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground text-[15px] outline-none"
          />
          <textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={300}
            className="w-full px-0 py-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground text-[17px] resize-none outline-none leading-relaxed"
            autoFocus
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className={`text-[13px] tabular-nums transition-colors ${isNearLimit ? "text-destructive" : "text-muted-foreground"}`}>
          {remaining}
        </span>
        <button
          type="submit"
          disabled={!content.trim() || isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-[14px] font-semibold px-4 py-2 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
        >
          {isPending ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  )
}
