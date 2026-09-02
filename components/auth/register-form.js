"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createClient } from '../../lib/supabase/client';

export function RegisterForm() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // 'idle' | 'confirm-email' — tracks post-signup state
  const [signUpState, setSignUpState] = useState('idle');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const router = useRouter();
  const supabase = createClient();

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    }

    if (!formData.email) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    
    if (!formData.password) {
      newErrors.password = 'Please enter a password.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Please enter your location.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name.trim(),
          location: formData.location.trim(),
        },
      },
    });

    setIsLoading(false);

    if (error) {
      // Rate limit — too many signup attempts for this email
      if (
        error.message.toLowerCase().includes('rate limit') ||
        error.message.toLowerCase().includes('email rate limit') ||
        error.status === 429
      ) {
        setErrors({ form: 'Too many attempts. Please wait a few minutes before trying again, or check your inbox for a previous confirmation email.' });
        return;
      }
      // Email already registered
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('user already exists') ||
        error.message.toLowerCase().includes('email already')
      ) {
        setErrors({ form: 'An account with this email already exists. Try signing in instead.' });
        return;
      }
      // All other errors — surface as-is
      setErrors({ form: error.message });
      return;
    }

    // Check whether Supabase returned an active session.
    // If email confirmation is required, data.session will be null.
    if (data.session) {
      // Email confirmation is disabled — user is immediately authenticated.
      router.push('/dashboard');
      router.refresh();
    } else {
      // Email confirmation is required — redirect to /verify-email screen with 6-digit OTP entry.
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: registeredEmail,
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
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // ── "Check your email" screen ────────────────────────────────────────────
  if (signUpState === 'confirm-email') {
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
            We sent a confirmation link to{' '}
            <span className="font-medium text-foreground">{registeredEmail}</span>.
            Click the link in the email to activate your account.
          </p>

          {resendStatus === 'sent' && (
            <p className="text-sm text-success font-medium" role="status">
              Confirmation email resent successfully.
            </p>
          )}
          {resendStatus === 'error' && (
            <p className="text-sm text-error font-medium" role="alert">
              Failed to resend. Please try again in a moment.
            </p>
          )}

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleResend}
            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
          >
            {resendStatus === 'sending' ? 'Resending...' : resendStatus === 'sent' ? 'Email Sent' : 'Resend Confirmation Email'}
          </Button>

          <p className="text-sm text-foreground-muted">
            Already confirmed?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Registration form ────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {errors.form && (
          <div className="rounded-md bg-error/10 border border-error/20 px-4 py-3 text-sm text-error" role="alert">
            {errors.form}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={errors.name ? "border-error focus-visible:ring-error" : ""}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-error font-medium" role="alert">
              {errors.name}
            </p>
          )}
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            className={errors.confirmPassword ? "border-error focus-visible:ring-error" : ""}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="text-sm text-error font-medium" role="alert">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="City, Country"
            value={formData.location}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? "location-error" : undefined}
            className={errors.location ? "border-error focus-visible:ring-error" : ""}
          />
          {errors.location && (
            <p id="location-error" className="text-sm text-error font-medium" role="alert">
              {errors.location}
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
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-foreground-secondary">
        Already have an account?{' '}
        <Link 
          href="/login" 
          className="font-medium text-primary hover:text-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
