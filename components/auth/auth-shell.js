import Link from 'next/link';

export function AuthShell({ children, title, subtitle }) {
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      {/* Brand Side (Desktop) */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 bg-surface-elevated border-r border-border p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Link 
            href="/" 
            className="inline-flex items-center text-2xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
          >
            Skill Exchange
          </Link>
          <div className="mt-16 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
              Exchange skills.<br />Build connections.
            </h1>
            <p className="text-lg text-foreground-secondary leading-relaxed max-w-md">
              Learn what you need. Teach what you know. The only currency is knowledge.
            </p>
          </div>
        </div>
        <div className="text-sm text-foreground-muted relative z-10">
          &copy; {new Date().getFullYear()} Skill Exchange. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-[400px]">
          {/* Mobile Brand / Back Link */}
          <div className="md:hidden mb-10">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Skill Exchange
            </Link>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{title}</h2>
            <p className="mt-2 text-base text-foreground-secondary">{subtitle}</p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
