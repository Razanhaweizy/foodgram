import { ReactNode } from "react"
import { Navbar } from "./navbar"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Foodgram. All rights reserved.
      </footer>
    </div>
  )
}
