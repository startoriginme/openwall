"use client"

import { useState, useEffect, useRef } from "react"
import { PostForm } from "./post-form"
import { X, Plus } from "lucide-react"

export function WriteModal() {
  const [open, setOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) setOpen(false)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <>
      {/* Fixed FAB - Bluesky style */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Write on the wall"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Modal */}
          <div
            className="bg-background w-full max-w-[600px] rounded-2xl relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Write on the wall"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-[53px] border-b border-border">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-8 h-8 -ml-1 rounded-full hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-[15px] font-semibold text-foreground">New Post</span>
              <div className="w-8" />
            </div>

            <div className="p-4">
              <PostForm onSuccess={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
