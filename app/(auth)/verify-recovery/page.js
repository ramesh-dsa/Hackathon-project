import { Suspense } from 'react';
import { AuthShell } from '../../../components/auth/auth-shell';
import { VerifyRecoveryForm } from '../../../components/auth/verify-recovery-form';

export const metadata = {
  title: 'Verify Recovery Code | Skill Exchange',
  description: 'Enter your 6-digit recovery code to reset your password.',
};

export default function VerifyRecoveryPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="text-center p-4 text-foreground-muted">Loading...</div>}>
        <VerifyRecoveryForm />
      </Suspense>
    </AuthShell>
  );
}
