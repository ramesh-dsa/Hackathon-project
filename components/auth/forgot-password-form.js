"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createClient } from '../../lib/supabase/client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const validate = () => {
    if (!email) {
      setEmailError('Please enter your email address.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setFormError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      // Supabase intentionally does not reveal whether the email exists.
      // Still surface real technical errors.
      if (error.message.toLowerCase().includes('rate limit') || error.status === 429) {
        setFormError('Too many requests. Please wait a few minutes before trying again.');
        return;
      }
      // For all other errors, show the "check email" screen anyway to avoid
      // leaking account enumeration.
      console.error('Password reset error:', error);
    }

    // Always navigate to verify-recovery screen to allow 6-digit OTP code entry.
    // Preserves privacy — does not reveal account existence.
    router.push(`/verify-recovery?email=${encodeURIComponent(email)}`);
  };

  if (submitted) {
    return (
      <div className="w-full">
        <div className="rounded-lg bg-surface-elevated border border-border p-6 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-primary-soft flex items-center justify-center">
              <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
          <p className="text-sm text-foreground-secondary">
            If an account exists for <span className="font-medium text-foreground">{email}</span>, 
            a password reset link has been sent. Check your inbox and follow the link.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {formError && (
          <div className="rounded-md bg-error/10 border border-error/20 px-4 py-3 text-sm text-error" role="alert">
            {formError}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            disabled={isLoading}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
            className={emailError ? "border-error focus-visible:ring-error" : ""}
          />
          {emailError && (
            <p id="email-error" className="text-sm text-error font-medium" role="alert">
              {emailError}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-foreground-secondary">
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
        >
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}
