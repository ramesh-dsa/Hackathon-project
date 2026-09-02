"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createClient } from '../../lib/supabase/client';

export function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // Track whether the error is specifically "email not confirmed"
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const router = useRouter();
  const supabase = createClient();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    
    if (!formData.password) {
      newErrors.password = 'Please enter your password.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    setEmailNotConfirmed(false);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setIsLoading(false);

      // Supabase returns "Email not confirmed" for unconfirmed accounts.
      // Detect it and give a helpful, actionable message.
      if (
        error.message.toLowerCase().includes('email not confirmed') ||
        error.code === 'email_not_confirmed'
      ) {
        setEmailNotConfirmed(true);
        return;
      }

      // "Invalid login credentials" — don't reveal whether email or password is wrong.
      if (
        error.message.toLowerCase().includes('invalid login credentials') ||
        error.message.toLowerCase().includes('invalid credentials') ||
        error.code === 'invalid_credentials'
      ) {
        setErrors({ form: 'Incorrect email or password. Please try again.' });
        return;
      }

      // Any other error — surface it directly.
      setErrors({ form: error.message });
      return;
    }

    // Login succeeded — check if profile is complete
    const { data: { user: loggedInUser } } = await supabase.auth.getUser();
    if (loggedInUser) {
      const { data: profile } = await supabase
        .from('users')
        .select('profile_complete')
        .eq('id', loggedInUser.id)
        .maybeSingle();

      if (profile?.profile_complete) {
        router.push('/dashboard');
      } else {
        router.push('/complete-profile');
      }
    } else {
      router.push('/dashboard');
    }
    router.refresh();
  };

  const handleResend = async () => {
    setResendStatus('sending');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: formData.email,
    });
    if (error) {
      setResendStatus('error');
    } else {
      setResendStatus('sent');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    // Clear "email not confirmed" banner when user changes email
    if (name === 'email' && emailNotConfirmed) {
      setEmailNotConfirmed(false);
      setResendStatus('idle');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* Generic error banner */}
        {errors.form && (
          <div className="rounded-md bg-error/10 border border-error/20 px-4 py-3 text-sm text-error" role="alert">
            {errors.form}
          </div>
        )}

        {/* Email not confirmed banner */}
        {emailNotConfirmed && (
          <div className="rounded-md bg-warning/10 border border-warning/20 px-4 py-3 space-y-3" role="alert">
            <p className="text-sm font-medium text-warning">
              Please confirm your email before signing in.
            </p>
            <p className="text-xs text-foreground-secondary">
              Enter the 6-digit verification code sent to your inbox.
            </p>
            {resendStatus === 'sent' && (
              <p className="text-xs text-success font-medium" role="status">
                Confirmation email resent. Check your inbox.
              </p>
            )}
            {resendStatus === 'error' && (
              <p className="text-xs text-error font-medium">
                Failed to resend. Please wait a moment and try again.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href={`/verify-email?email=${encodeURIComponent(formData.email)}`}
                className="flex-1 text-center bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-1.5 px-3 rounded-md text-xs transition-colors"
              >
                Enter 6-Digit Code
              </Link>
              <Button
                type="button"
                variant="secondary"
                className="flex-1 !py-1.5 !text-xs"
                onClick={handleResend}
                disabled={resendStatus === 'sending' || resendStatus === 'sent'}
              >
                {resendStatus === 'sending' ? 'Resending...' : resendStatus === 'sent' ? 'Email Sent' : 'Resend Code'}
              </Button>
            </div>
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
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={errors.email ? "border-error focus-visible:ring-error" : ""}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-error font-medium" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              href="/forgot-password" 
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={errors.password ? "border-error focus-visible:ring-error" : ""}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-error font-medium" role="alert">
              {errors.password}
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
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-foreground-secondary">
        New to Skill Exchange?{' '}
        <Link 
          href="/register" 
          className="font-medium text-primary hover:text-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
