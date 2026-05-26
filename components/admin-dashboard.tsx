"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Trash2, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import useSWR from "swr"

interface Post {
  id: string
  content: string
  author_name: string
  created_at: string
}

interface Comment {
  id: string
  post_id: string
  content: string
  author_name: string
  created_at: string
}

interface AdminDashboardProps {
  password: string
  onLogout: () => void
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export function AdminDashboard({ password, onLogout }: AdminDashboardProps) {
  const { data: posts = [], mutate: mutatePosts } = useSWR<Post[]>(
    "/api/posts",
    fetcher,
    { refreshInterval: 3000 }
  )

  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)

  const { data: allComments = [], mutate: mutateComments } = useSWR<Comment[]>(
    "/api/admin/comments",
    fetcher,
    { refreshInterval: 3000 }
  )

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post? All comments will also be deleted.")) return

    setDeletingId(postId)
    try {
      const response = await fetch("/api/admin/delete-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Error deleting post")
        return
      }

      mutatePosts()
      mutateComments()
    } catch (error) {
      console.error("[v0] Error deleting post:", error)
      alert("Error deleting post")
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return

    setDeletingId(commentId)
    try {
      const response = await fetch("/api/admin/delete-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Error deleting comment")
        return
      }

      mutateComments()
    } catch (error) {
      console.error("[v0] Error deleting comment:", error)
      alert("Error deleting comment")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-[53px] flex items-center justify-between">
          <h1 className="text-[17px] font-bold text-foreground">Openwall Admin</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 flex">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-3 text-[15px] font-medium border-b-2 transition-colors ${
              activeTab === "posts"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-3 text-[15px] font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "comments"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Comments ({allComments.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === "posts" && (
          <div className="divide-y divide-border">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found</p>
              </div>
            ) : (
              posts.map((post) => {
                const postComments = allComments.filter(c => c.post_id === post.id)
                return (
                  <div key={post.id} className="px-4 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary text-sm font-semibold">
                          {post.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[14px]">
                          <span className="font-semibold text-foreground">{post.author_name}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[15px] text-foreground mt-1 whitespace-pre-wrap break-words">
                          {post.content}
                        </p>
                        
                        {postComments.length > 0 && (
                          <button
                            onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                            className="flex items-center gap-1 mt-2 text-[13px] text-primary hover:underline"
                          >
                            {expandedPostId === post.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {postComments.length} comment{postComments.length > 1 ? "s" : ""}
                          </button>
                        )}

                        {expandedPostId === post.id && postComments.length > 0 && (
                          <div className="mt-3 ml-4 pl-3 border-l-2 border-border space-y-2">
                            {postComments.map((comment) => (
                              <div key={comment.id} className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[13px] font-medium text-foreground">{comment.author_name}</span>
                                  <span className="text-[13px] text-muted-foreground ml-1">
                                    · {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                  </span>
                                  <p className="text-[14px] text-foreground/80">{comment.content}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  disabled={deletingId === comment.id}
                                  className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingId === post.id}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === post.id ? "..." : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="divide-y divide-border">
            {allComments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No comments found</p>
              </div>
            ) : (
              allComments.map((comment) => {
                const parentPost = posts.find(p => p.id === comment.post_id)
                return (
                  <div key={comment.id} className="px-4 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-secondary-foreground text-xs font-semibold">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[13px]">
                          <span className="font-medium text-foreground">{comment.author_name}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[14px] text-foreground mt-0.5">{comment.content}</p>
                        {parentPost && (
                          <p className="text-[12px] text-muted-foreground mt-1">
                            Replying to: {parentPost.content.slice(0, 50)}...
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingId === comment.id}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === comment.id ? "..." : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
