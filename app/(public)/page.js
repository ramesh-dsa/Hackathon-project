import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar } from "../../components/ui/avatar";
import { Rating } from "../../components/ui/rating";
import { Badge } from "../../components/ui/badge";
import CurvedLoop from "../../components/ui/curved-loop";
import BlurText from "../../components/ui/blur-text";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full pb-20">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] py-20 px-4 text-center">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Badge variant="brand" className="mb-6 px-4 py-1.5 text-sm">Welcome to Skill Exchange</Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            <BlurText text="Exchange skills," delay={150} animateBy="words" direction="top" className="inline-block" />
            {' '}<span className="text-primary">not money.</span>
          </h1>
          <p className="text-xl text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
            Join a community of learners and teachers. Offer what you know, and learn what you want. The only currency is knowledge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button as={Link} href="/register" size="large" variant="primary" className="w-full sm:w-auto">
              Get Started
            </Button>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-surface/50 border-t border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">How it works</h2>
            <p className="text-foreground-secondary mt-4">Simple, reciprocal, and entirely free.</p>
          </div>
          <div className="flex flex-col gap-12 max-w-2xl mx-auto">
            <div className="flex items-start gap-6">
              <span className="text-2xl font-light text-primary mt-1">01</span>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Offer what you know</h3>
                <p className="text-foreground-secondary mt-2">Share your expertise. Everyone has something valuable to teach.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <span className="text-2xl font-light text-primary mt-1">02</span>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Tell us what you want to learn</h3>
                <p className="text-foreground-secondary mt-2">Whether it's a new language, coding, or design, let the community know.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <span className="text-2xl font-light text-primary mt-1">03</span>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Find someone with a matching skill</h3>
                <p className="text-foreground-secondary mt-2">Our platform highlights users who want what you offer and offer what you want.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <span className="text-2xl font-light text-primary mt-1">04</span>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Exchange knowledge</h3>
                <p className="text-foreground-secondary mt-2">Connect, set up a time, and start learning from each other.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <span className="text-2xl font-light text-primary mt-1">05</span>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Build trust through reviews</h3>
                <p className="text-foreground-secondary mt-2">Leave honest feedback after your exchange to strengthen the community.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Curved Loop Transition */}
      <section
        aria-label="Skill Exchange values"
        className="relative border-y border-border/60 bg-surface/30"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper-500/40 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper-500/40 to-transparent"
        />
        <CurvedLoop
          marqueeText="SHARE ✦ LEARN ✦ EXCHANGE ✦ CONNECT ✦ TRUST ✦ "
          speed={1.5}
          curveAmount={400}
          direction="left"
          interactive={true}
          className="drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
        />
      </section>

      {/* Example Match Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">The perfect match</h2>
          <p className="text-foreground-secondary mb-12">The platform creates opportunities for reciprocal skill exchange.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-4">
              <Avatar src="https://i.pravatar.cc/150?u=ramesh" alt="Ramesh" size="lg" />
              <div className="text-center">
                <p className="font-semibold text-foreground">Ramesh</p>
                <p className="text-sm text-foreground-secondary">Can teach <span className="text-primary">Java</span></p>
                <p className="text-sm text-foreground-secondary">Wants to learn <span className="text-primary">UI/UX</span></p>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center text-border-strong">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Avatar src="https://i.pravatar.cc/150?u=priya" alt="Priya" size="lg" />
              <div className="text-center">
                <p className="font-semibold text-foreground">Priya</p>
                <p className="text-sm text-foreground-secondary">Can teach <span className="text-primary">UI/UX</span></p>
                <p className="text-sm text-foreground-secondary">Wants to learn <span className="text-primary">Java</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-surface/30 border-t border-border">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <Badge variant="outline" className="mb-4">Our Mission</Badge>
          <h2 className="text-3xl font-bold text-foreground">About Skill Exchange</h2>
          <p className="text-lg text-foreground-secondary leading-relaxed mx-auto">
            We believe that everyone has something valuable to teach and something new they want to learn. Skill Exchange was built to break down financial barriers to education by creating a community where knowledge is the only currency.
          </p>
        </div>
      </section>

      {/* Trust & CTA */}
      <section className="py-24 px-4 bg-surface-card border-t border-border">
        <div className="container mx-auto max-w-3xl text-center space-y-8">
          <h2 className="text-3xl font-bold text-foreground">Trust is our foundation</h2>
          <p className="text-lg text-foreground-secondary">
            Verified profiles and peer ratings ensure a safe, respectful, and high-quality learning environment.
          </p>
          <div className="flex justify-center py-4">
            <Rating value={4.9} count={124} className="scale-125" />
          </div>
          <div className="pt-8">
            <Button as={Link} href="/register" size="large" variant="primary">
              Join Skill Exchange
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
