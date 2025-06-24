"use client"

import { useEffect } from "react"

export function CursorPreload() {
  useEffect(() => {
    const preloadCursors = async () => {
      const cursors = [
        "/cursors/surfing-default.ani",
        "/cursors/surfing-default.cur",
        "/cursors/surfing-pointer.ani",
        "/cursors/surfing-pointer.cur",
      ]

      cursors.forEach((cursor) => {
        const link = document.createElement("link")
        link.rel = "preload"
        link.as = "image"
        link.href = cursor
        document.head.appendChild(link)
      })
    }

    preloadCursors()
  }, [])

  return null
}

