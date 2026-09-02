import { Suspense } from 'react';
import { AuthShell } from '../../../components/auth/auth-shell';
import { VerifyEmailForm } from '../../../components/auth/verify-email-form';

export const metadata = {
  title: 'Verify Email | Skill Exchange',
  description: 'Enter your 6-digit verification code to activate your account.',
};

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="text-center p-4 text-foreground-muted">Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}
