import { AuthLayout } from '@/components/layout/AuthLayout';
import { SignupForm } from '@/components/features/auth/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout
      title="회원가입"
      subtitle="새 계정을 만들어 채팅을 시작하세요"
    >
      <SignupForm />
    </AuthLayout>
  );
}
