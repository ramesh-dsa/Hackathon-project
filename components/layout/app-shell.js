'use client';
import { useState } from 'react';
import { SidebarContent } from './sidebar';
import { Drawer } from '../ui/drawer';
import { Button } from '../ui/button';
import Link from 'next/link';

export function AppShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar (hidden on mobile/tablet) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface-card fixed inset-y-0 z-40">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile/Tablet Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-foreground">
              Skill Exchange
            </span>
          </Link>
          <Button 
            variant="ghost" 
            size="small" 
            className="px-2"
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
        </header>

        {/* Mobile Navigation Drawer */}
        <Drawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} side="left">
          <div className="flex h-16 items-center justify-end px-4 border-b border-border">
            <Button variant="ghost" size="small" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="px-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarContent onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </Drawer>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pt-12">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
