import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[v0] Error fetching posts:", error)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(posts)
}
