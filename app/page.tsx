import { createClient } from "@/lib/supabase/server"
import { PostsList } from "@/components/posts-list"
import { WriteModal } from "@/components/write-modal"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Bluesky-style header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-[600px] mx-auto px-4 h-[53px] flex items-center">
          <h1 className="text-[17px] font-bold text-foreground">Openwall</h1>
        </div>
      </header>

      {/* Posts feed */}
      <main className="flex-1">
        <div className="max-w-[600px] mx-auto border-x border-border min-h-[calc(100vh-53px-60px)]">
          <PostsList initialPosts={posts || []} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 bg-background">
        <div className="max-w-[600px] mx-auto px-4 text-center">
          <p className="text-[13px] text-muted-foreground">
            Developed with TypeScript by Max Nikolaev from 7th grade.
          </p>
        </div>
      </footer>

      {/* Fixed FAB + Modal */}
      <WriteModal />
    </div>
  )
}
