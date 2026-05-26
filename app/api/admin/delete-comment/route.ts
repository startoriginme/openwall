import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { commentId, password } = await request.json()

    // Verify password
    const correctPassword = "RealMaveboStenaAdminModeration67"
    if (password !== correctPassword) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      )
    }

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      )
    }

    // Delete comment using service role key
    const { error } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (error) {
      console.error("[v0] Error deleting comment:", error)
      return NextResponse.json(
        { error: "Failed to delete comment" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in delete-comment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
