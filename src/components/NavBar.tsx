import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "@/components/themeSwitch";

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-16 px-6 md:px-16 relative flex items-center justify-between">
        {/* Left section - Brand */}
        <div className="flex-shrink-0 w-1/4">
          <Link href="/" className="flex items-center font-bold text-xl">
            Prompt App
          </Link>
        </div>

        {/* Middle section - Navigation Links - Absolutely Centered*/}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex space-x-6">
            <Link
              href="/prompts"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Prompts
            </Link>
            <Link
              href="/drafts"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Drafts
            </Link>
          </div>
        </div>

        {/* Right section - Theme Toggle & Login */}
        <div className="flex-shrink-0 w-1/4 flex items-center justify-end space-x-4">
          <ThemeSwitch />
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}