'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '../ui/avatar';
import { cn } from '../../lib/utils';

const workspaceLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/discover', label: 'Discover' },
  { href: '/my-skills', label: 'My Skills' },
  { href: '/requests', label: 'Requests' },
  { href: '/exchanges', label: 'Exchanges' },
];

const communityLinks = [
  { href: '/profile/u1', label: 'Profile' },
];

export function SidebarContent({ onLinkClick }) {
  const pathname = usePathname();

  const renderLink = (link) => {
    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onLinkClick}
        className={cn(
          "relative flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          isActive 
            ? "bg-surface-hover text-foreground" 
            : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-primary" aria-hidden="true" />
        )}
        <span className={cn("ml-2", isActive && "ml-1")}>{link.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-8 px-3">
        <Link href="/dashboard" className="flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-md">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Skill Exchange
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-8">
        <div>
          <h2 className="mb-2 px-3 text-xs font-semibold tracking-wider text-foreground-muted uppercase">Workspace</h2>
          <div className="space-y-1">
            {workspaceLinks.map(renderLink)}
          </div>
        </div>

        <div>
          <h2 className="mb-2 px-3 text-xs font-semibold tracking-wider text-foreground-muted uppercase">Community</h2>
          <div className="space-y-1">
            {communityLinks.map(renderLink)}
          </div>
        </div>
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <div className="mb-4 flex items-center px-3 gap-3">
          <Avatar src="https://i.pravatar.cc/150?u=ramesh" alt="Ramesh" size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Ramesh</span>
            <span className="text-xs text-foreground-muted">Pro Member</span>
          </div>
        </div>
        <div className="space-y-1">
          <Link href="#" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition-colors">
            Settings
          </Link>
          <Link href="/" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-hover hover:text-foreground transition-colors">
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}
