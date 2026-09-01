import { AuthShell } from '../../../components/auth/auth-shell';
import { RegisterForm } from '../../../components/auth/register-form';

export const metadata = {
  title: 'Create Account | Skill Exchange',
  description: 'Join the community and start exchanging skills.',
};

export default function RegisterPage() {
  return (
    <AuthShell 
      title="Create your account" 
      subtitle="Join the community and start exchanging skills."
    >
      <RegisterForm />
    </AuthShell>
  );
}
