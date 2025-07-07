import type { ReactNode } from "react"

export default function DemoLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}