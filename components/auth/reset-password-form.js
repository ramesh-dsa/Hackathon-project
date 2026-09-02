"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createClient } from '../../lib/supabase/client';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error' | 'invalid-link'
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // The Supabase password-reset email link contains a hash fragment with tokens.
    // When the user lands here, Supabase automatically exchanges those tokens for a session.
    // We listen for PASSWORD_RECOVERY to confirm a valid recovery session is active.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasSession(true);
      }
    });

    // Also check for an existing session (in case the user reloads this page).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setHasSession(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'Please enter a new password.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setIsLoading(false);

    if (error) {
      setErrors({ form: error.message });
      setStatus('error');
      return;
    }

    setStatus('success');
    // Sign out so the user goes through a clean login with the new password.
    await supabase.auth.signOut();
    setTimeout(() => router.push('/login'), 2500);
  };

  if (!hasSession) {
    return (
      <div className="w-full">
        <div className="rounded-lg bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning space-y-2" role="alert">
          <p className="font-medium">Invalid or expired reset link.</p>
          <p className="text-foreground-secondary">Password reset links expire after a short time. Please request a new one.</p>
        </div>
        <div className="mt-6 text-center">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full">
        <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-4 text-center space-y-2" role="status">
          <p className="text-sm font-medium text-success">Password updated successfully!</p>
          <p className="text-xs text-foreground-secondary">Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {errors.form && (
          <div className="rounded-md bg-error/10 border border-error/20 px-4 py-3 text-sm text-error" role="alert">
            {errors.form}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }}
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
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
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

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}
