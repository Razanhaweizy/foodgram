import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          🍲 Foodgram
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link href="/recipes">Recipes</Link>
          <Link href="/tags">Tags</Link>
          <Link href="/about">About</Link>
        </div>

        {/* Auth buttons */}
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
