import { AuthShell } from '../../../components/auth/auth-shell';
import { ResetPasswordForm } from '../../../components/auth/reset-password-form';

export const metadata = {
  title: 'Set New Password | Skill Exchange',
  description: 'Set a new password for your Skill Exchange account.',
};

export default function ResetPasswordPage() {
  return (
    <AuthShell 
      title="Set new password" 
      subtitle="Enter a new password for your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
