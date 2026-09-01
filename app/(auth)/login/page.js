import { AuthShell } from '../../../components/auth/auth-shell';
import { LoginForm } from '../../../components/auth/login-form';

export const metadata = {
  title: 'Sign In | Skill Exchange',
  description: 'Sign in to continue exchanging skills.',
};

export default function LoginPage() {
  return (
    <AuthShell 
      title="Welcome back" 
      subtitle="Sign in to continue exchanging skills."
    >
      <LoginForm />
    </AuthShell>
  );
}
