'use client';
import { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Drawer } from "../ui/drawer";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-md">
              <span className="text-xl font-bold tracking-tight text-foreground">
                Skill Exchange
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">

              <Link href="/#how-it-works" className="text-foreground-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm">
                How It Works
              </Link>
              <Link href="/#about" className="text-foreground-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm">
                About
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hidden md:inline-flex text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm">
              Sign In
            </Link>
            <Button as={Link} href="/register" variant="primary" className="hidden sm:inline-flex">
              Get Started
            </Button>
            
            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="small" 
              className="md:hidden px-2"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <Drawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} side="right">
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <span className="text-lg font-bold tracking-tight text-foreground">Menu</span>
          <Button variant="ghost" size="small" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="px-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>
        <nav className="flex flex-col p-4 space-y-4">

          <Link href="/#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-3 text-base font-medium text-foreground-secondary hover:text-foreground transition-colors border-b border-border/50">
            How It Works
          </Link>
          <Link href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-3 text-base font-medium text-foreground-secondary hover:text-foreground transition-colors border-b border-border/50">
            About
          </Link>
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-2 text-base font-medium text-foreground-secondary hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button as={Link} href="/register" variant="primary" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
              Get Started
            </Button>
          </div>
        </nav>
      </Drawer>
    </header>
  );
}
