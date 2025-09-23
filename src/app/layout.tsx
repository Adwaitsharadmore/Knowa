import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Knowa - Enterprise Knowledge Copilot",
  description: "AI-powered knowledge management platform for enterprises. Connect, organize, and access your knowledge base with intelligent search and automation.",
  keywords: ["knowledge management", "AI", "enterprise", "RAG", "document management", "search", "automation"],
  openGraph: {
    title: "Knowa - Enterprise Knowledge Copilot",
    description: "AI-powered knowledge management platform for enterprises",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
