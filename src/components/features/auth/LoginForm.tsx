'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ERROR_MESSAGES, ERROR_CODES, ErrorCode } from '@/constants/error.constants';
import { isOk } from '@/utils/result.utils';
import { validateEmail, validatePassword } from '@/utils/validation.utils';

export const LoginForm = (): JSX.Element => {
  const router = useRouter();
  const { state, actions } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.success) {
      newErrors.email = ERROR_MESSAGES[emailValidation.error as ErrorCode];
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.success) {
      newErrors.password = ERROR_MESSAGES[passwordValidation.error as ErrorCode];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    actions.clearError();

    if (!validate()) return;

    const result = await actions.login(email, password);

    if (isOk(result)) {
      router.push('/rooms');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.error && (
        <ErrorMessage
          message={ERROR_MESSAGES[state.error as ErrorCode] || ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR]}
          onRetry={actions.clearError}
        />
      )}

      <Input
        label="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="example@email.com"
        autoComplete="email"
        required
      />

      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="비밀번호를 입력하세요"
        autoComplete="current-password"
        required
      />

      <Button
        type="submit"
        fullWidth
        isLoading={state.isLoading}
      >
        로그인
      </Button>

      <p className="text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
          회원가입
        </Link>
      </p>
    </form>
  );
};
