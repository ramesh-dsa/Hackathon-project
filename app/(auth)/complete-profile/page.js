import { Suspense } from 'react';
import { AuthShell } from '../../../components/auth/auth-shell';
import { CompleteProfileForm } from '../../../components/auth/complete-profile-form';

export const metadata = {
  title: 'Complete Your Profile | Skill Exchange',
  description: 'Set up your profile to start exchanging skills with others.',
};

export default function CompleteProfilePage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="text-center p-4 text-foreground-muted">Loading...</div>}>
        <CompleteProfileForm />
      </Suspense>
    </AuthShell>
  );
}
