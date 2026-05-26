"use client"

import { PostCard } from "./post-card"
import useSWR from "swr"

interface Post {
  id: string
  content: string
  author_name: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function PostsList({ initialPosts }: { initialPosts: Post[] }) {
  const { data: posts } = useSWR<Post[]>("/api/posts", fetcher, {
    fallbackData: initialPosts,
    refreshInterval: 5000,
  })

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-xl">+</span>
        </div>
        <div className="text-center">
          <p className="text-foreground font-medium">No posts yet</p>
          <p className="text-muted-foreground text-[14px] mt-1">
            Be the first to write something!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          content={post.content}
          authorName={post.author_name}
          createdAt={post.created_at}
        />
      ))}
    </div>
  )
}
