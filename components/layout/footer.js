import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-lg font-bold text-foreground">Skill Exchange</span>
          <p className="text-sm text-foreground-muted mt-1">Exchange skills, not money.</p>
        </div>
        <div className="flex gap-6 text-sm text-foreground-secondary">
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
