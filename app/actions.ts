"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createPost(content: string, authorName: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("posts").insert({
    content,
    author_name: authorName || "Anonymous",
  })

  if (error) {
    console.error("[v0] Error creating post:", error)
    throw new Error("Failed to publish post")
  }

  revalidatePath("/")
}

export async function createComment(postId: string, content: string, authorName: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content,
    author_name: authorName || "Anonymous",
  })

  if (error) {
    console.error("[v0] Error creating comment:", error)
    throw new Error("Failed to publish comment")
  }

  revalidatePath("/")
}
