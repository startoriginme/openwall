"use client"

import { useState, useTransition } from "react"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, MoreHorizontal } from "lucide-react"
import { createComment } from "@/app/actions"
import useSWR from "swr"

interface Comment {
  id: string
  content: string
  author_name: string
  created_at: string
}

interface PostCardProps {
  id: string
  content: string
  authorName: string
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function PostCard({ id, content, authorName, createdAt }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [commentAuthor, setCommentAuthor] = useState("")
  const [isPending, startTransition] = useTransition()

  const { data: comments, mutate } = useSWR<Comment[]>(
    showComments ? `/api/comments?postId=${id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: false })

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    startTransition(async () => {
      await createComment(id, commentText.trim(), commentAuthor.trim() || "Anonymous")
      setCommentText("")
      setCommentAuthor("")
      mutate()
    })
  }

  return (
    <article className="border-b border-border hover:bg-muted/30 transition-colors">
      <div className="px-4 py-3">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary text-sm font-semibold">
              {authorName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-1 text-[15px]">
              <span className="font-semibold text-foreground truncate">{authorName}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground text-[14px]">{timeAgo}</span>
              <button className="ml-auto p-1.5 -mr-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Post content */}
            <p className="text-[15px] text-foreground leading-normal mt-0.5 whitespace-pre-wrap break-words">
              {content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-6 mt-3 -ml-2">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors group"
              >
                <MessageCircle className="w-[18px] h-[18px] group-hover:text-primary" />
                <span className="text-[13px] group-hover:text-primary">
                  {comments?.length || "Reply"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border bg-muted/20">
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="px-4 py-3 border-b border-border">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-semibold">
                  {commentAuthor.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  maxLength={50}
                  className="w-full text-[13px] text-foreground placeholder:text-muted-foreground bg-transparent outline-none mb-1"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={200}
                    className="flex-1 text-[14px] text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-semibold px-3 py-1 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isPending ? "..." : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {comments && comments.length > 0 && (
            <div className="divide-y divide-border">
              {comments.map((comment) => (
                <div key={comment.id} className="px-4 py-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-secondary-foreground text-xs font-semibold">
                        {comment.author_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[14px]">
                        <span className="font-medium text-foreground">{comment.author_name}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground text-[13px]">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: false })}
                        </span>
                      </div>
                      <p className="text-[14px] text-foreground leading-normal mt-0.5">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {comments && comments.length === 0 && (
            <div className="px-4 py-6 text-center text-muted-foreground text-[14px]">
              No replies yet. Be the first!
            </div>
          )}
        </div>
      )}
    </article>
  )
}
