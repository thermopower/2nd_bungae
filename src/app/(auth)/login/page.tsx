import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="로그인"
      subtitle="계정에 로그인하여 채팅을 시작하세요"
    >
      <LoginForm />
    </AuthLayout>
  );
}
