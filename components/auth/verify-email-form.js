"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { OtpInput } from './otp-input';
import { createClient } from '../../lib/supabase/client';

/**
 * Mask email for privacy (e.g. r******@gmail.com)
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 6))}${local[local.length - 1]}@${domain}`;
}

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 60-second resend cooldown timer
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Handle 60s countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    if (!email) {
      setError('Email address is missing. Please return to registration.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setError('');
    setSuccess('');

    // Call Supabase verifyOtp API for signup email verification
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    setIsVerifying(false);

    if (verifyError) {
      const msg = verifyError.message.toLowerCase();
      if (msg.includes('expired') || msg.includes('token is expired')) {
        setError('This verification code has expired. Please request a new code.');
      } else if (msg.includes('invalid') || verifyError.status === 400 || verifyError.status === 422) {
        setError('Invalid verification code.');
      } else {
        setError('Invalid verification code.');
      }
      return;
    }

    setSuccess('Email verified successfully! Redirecting...');
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 1000);
  };

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && !isVerifying && !success) {
      handleVerify();
    }
  }, [otp]);

  const handleResend = async () => {
    if (!canResend || isResending || !email) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    setIsResending(false);

    if (resendError) {
      const msg = resendError.message.toLowerCase();
      if (msg.includes('rate limit') || resendError.status === 429) {
        setError('Please wait before requesting another code.');
      } else {
        setError('Failed to resend code. Please try again in a moment.');
      }
      return;
    }

    setSuccess('New verification code sent to your email.');
    setCanResend(false);
    setCountdown(60);
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Verify your email</h2>
        <p className="text-sm text-foreground-secondary">
          We&apos;ve sent a 6-digit verification code to{' '}
          <span className="font-medium text-foreground">{maskEmail(email) || 'your email'}</span>.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6" noValidate>
        {error && (
          <div
            id="otp-error"
            className="rounded-md bg-error/10 border border-error/20 px-4 py-3 text-sm text-error text-center font-medium"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="rounded-md bg-success/10 border border-success/20 px-4 py-3 text-sm text-success text-center font-medium"
            role="status"
          >
            {success}
          </div>
        )}

        <div className="space-y-2">
          <OtpInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (error) setError('');
            }}
            disabled={isVerifying || !!success}
            hasError={!!error}
            ariaDescribedBy={error ? "otp-error" : undefined}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isVerifying || otp.length !== 6 || !!success}
          aria-busy={isVerifying}
        >
          {isVerifying ? 'Verifying...' : 'Verify Code'}
        </Button>
      </form>

      <div className="text-center space-y-3 pt-2">
        <p className="text-sm text-foreground-secondary">
          Didn&apos;t receive the code?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-medium text-primary hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-focus rounded-sm transition-colors"
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          ) : (
            <span className="font-medium text-foreground-muted cursor-not-allowed">
              Resend code in {countdown}s
            </span>
          )}
        </p>

        <p className="text-xs text-foreground-muted">
          Need to change your email?{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Back to registration
          </Link>
        </p>
      </div>
    </div>
  );
}
