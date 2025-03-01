import Link from "next/link"
import { Button } from "@/components/ui/button"
import ThemeSwitch from "@/components/ui/themeSwitch"

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" flex h-16 items-center px-16">
        {/* Left section - Brand */}
        <div className="flex">
          <Link href="/" className="flex items-center font-bold text-xl">
            Prompt App
          </Link>
        </div>

        {/* Middle section - Navigation Links */}
        <div className="mx-auto flex space-x-6">
          <Link
            href="/prompts"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Prompts
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            About
          </Link>
        </div>

        {/* Right section - Theme Toggle & Login */}
        <div className="flex items-center space-x-4">
          <ThemeSwitch />
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}