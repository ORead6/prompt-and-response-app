"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "@/components/themeSwitch";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Menu, X, Home, ListPlus, FileEdit, LogOut } from "lucide-react";

export function NavBar() {
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  // Handle Logout
  const handleLogout = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Close mobile sidebar when navigating
  const handleNavigation = () => {
    setMobileSidebarOpen(false);
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileSidebarOpen && !event.target.closest('.mobile-sidebar') &&
        !event.target.closest('.mobile-menu-button')) {
        setMobileSidebarOpen(false);
      }
    };

    // Handle escape key press
    const handleEscKey = (event) => {
      if (mobileSidebarOpen && event.key === 'Escape') {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [mobileSidebarOpen]);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-16 px-4 sm:px-6 md:px-16 relative flex items-center justify-between">
          {/* Left section - Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center font-bold text-xl">
              Prompt App
            </Link>
          </div>

          {/* Middle section - Navigation Links - Absolutely Centered - Desktop Only */}
          <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex space-x-6">
              <Link
                href="/prompts"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Prompts
              </Link>
            </div>
          </div>

          {/* Right section - Theme Toggle & Authentication - Desktop */}
          <div className="flex items-center">
            <div className="hidden sm:flex items-center space-x-2">
              <ThemeSwitch />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 hover:bg-red-100/20"
              >
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden ml-2 mobile-menu-button">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" aria-hidden="true" />
      )}

      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg transform transition-transform duration-200 ease-in-out mobile-sidebar ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/" className="flex items-center font-bold text-xl" onClick={handleNavigation}>
            Prompt App
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          {/* Navigation links */}
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
              onClick={handleNavigation}
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
            <Link
              href="/prompts"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
              onClick={handleNavigation}
            >
              <ListPlus className="mr-2 h-4 w-4" />
              Prompts
            </Link>
          </div>

          {/* Theme switcher and logout at bottom */}
          <div className="border-t px-4 py-4 space-y-3">
            <div className="flex items-center px-3 py-2 rounded-md">
              <ThemeSwitch />
              <span className="ml-2 text-sm font-medium">Theme</span>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-100/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}