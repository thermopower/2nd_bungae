# 회원가입 페이지 구현 계획

## 1. 개요

신규 계정 생성을 위한 회원가입 페이지입니다.

### 페이지 정보
- **경로**: `/signup`
- **인증 필요**: X (공개 페이지)
- **상태관리**: AuthContext (회원가입 처리)

---

## 2. 구현할 파일 목록

```
src/app/(auth)/
└── signup/
    └── page.tsx                 # 회원가입 페이지

src/components/features/auth/
├── SignupForm.tsx               # 회원가입 폼 컴포넌트
└── index.ts                     # 내보내기 (업데이트)
```

---

## 3. 상세 구현 내용

### 3.1 회원가입 페이지 (app/(auth)/signup/page.tsx)

```typescript
// src/app/(auth)/signup/page.tsx
import { AuthLayout } from '@/components/layout/AuthLayout';
import { SignupForm } from '@/components/features/auth/SignupForm';

export const metadata = {
  title: '회원가입 - ChatApp',
  description: 'ChatApp에 가입하고 채팅을 시작하세요',
};

export default function SignupPage(): JSX.Element {
  return (
    <AuthLayout
      title="회원가입"
      subtitle="새 계정을 만들어 채팅을 시작하세요"
    >
      <SignupForm />
    </AuthLayout>
  );
}
```

### 3.2 회원가입 폼 컴포넌트 (SignupForm.tsx)

```typescript
// src/components/features/auth/SignupForm.tsx
'use client';

import { useState, FormEvent, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { isValidEmail, isValidPassword } from '@/utils/validation.utils';

interface FormState {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
}

interface FormErrors {
  readonly email?: string;
  readonly password?: string;
  readonly confirmPassword?: string;
}

const initialFormState: FormState = {
  email: '',
  password: '',
  confirmPassword: '',
};

// 비밀번호 강도 체크 (순수 함수)
const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 8) return 'weak';

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (strength >= 3 && password.length >= 10) return 'strong';
  if (strength >= 2) return 'medium';
  return 'weak';
};

const strengthLabels = {
  weak: { text: '약함', color: 'bg-red-500' },
  medium: { text: '보통', color: 'bg-yellow-500' },
  strong: { text: '강함', color: 'bg-green-500' },
};

export const SignupForm = (): JSX.Element => {
  const router = useRouter();
  const { state, actions } = useAuth();

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const passwordStrength = formState.password ? getPasswordStrength(formState.password) : null;

  // 입력값 변경 핸들러
  const handleChange = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      if (state.error) {
        actions.clearError();
      }
    },
    [state.error, actions]
  );

  // 클라이언트 측 유효성 검증
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    // 이메일 검증
    if (!formState.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!isValidEmail(formState.email)) {
      errors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    // 비밀번호 검증
    if (!formState.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (!isValidPassword(formState.password)) {
      errors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    // 비밀번호 확인 검증
    if (!formState.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formState.password !== formState.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState]);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      const success = await actions.signup(formState.email, formState.password);

      if (success) {
        router.push('/rooms');
      }
    },
    [formState, validateForm, actions, router]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 서버 에러 메시지 */}
      {state.error && (
        <ErrorMessage
          message={state.error.message}
          onRetry={actions.clearError}
        />
      )}

      {/* 이메일 입력 */}
      <Input
        type="email"
        label="이메일"
        placeholder="name@example.com"
        value={formState.email}
        onChange={handleChange('email')}
        error={formErrors.email}
        disabled={state.isLoading}
        autoComplete="email"
        autoFocus
      />

      {/* 비밀번호 입력 */}
      <div className="space-y-2">
        <Input
          type="password"
          label="비밀번호"
          placeholder="8자 이상 입력하세요"
          value={formState.password}
          onChange={handleChange('password')}
          error={formErrors.password}
          disabled={state.isLoading}
          autoComplete="new-password"
        />

        {/* 비밀번호 강도 표시 */}
        {passwordStrength && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${strengthLabels[passwordStrength].color}`}
                style={{
                  width: passwordStrength === 'weak' ? '33%' :
                         passwordStrength === 'medium' ? '66%' : '100%',
                }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {strengthLabels[passwordStrength].text}
            </span>
          </div>
        )}
      </div>

      {/* 비밀번호 확인 입력 */}
      <Input
        type="password"
        label="비밀번호 확인"
        placeholder="비밀번호를 다시 입력하세요"
        value={formState.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={formErrors.confirmPassword}
        disabled={state.isLoading}
        autoComplete="new-password"
      />

      {/* 회원가입 버튼 */}
      <Button
        type="submit"
        fullWidth
        isLoading={state.isLoading}
        disabled={!formState.email || !formState.password || !formState.confirmPassword}
      >
        회원가입
      </Button>

      {/* 이용약관 안내 */}
      <p className="text-center text-xs text-gray-500">
        회원가입 시{' '}
        <a href="#" className="text-blue-600 hover:underline">이용약관</a>
        {' '}및{' '}
        <a href="#" className="text-blue-600 hover:underline">개인정보처리방침</a>
        에 동의하는 것으로 간주합니다.
      </p>

      {/* 로그인 링크 */}
      <p className="text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          로그인
        </Link>
      </p>
    </form>
  );
};
```

### 3.3 인덱스 파일 업데이트

```typescript
// src/components/features/auth/index.ts
export { LoginForm } from './LoginForm';
export { SignupForm } from './SignupForm';
```

---

## 4. 기능 요구사항

### 4.1 입력 필드

| 필드 | 타입 | 필수 | 검증 |
|------|------|------|------|
| email | email | O | 이메일 형식 검증 |
| password | password | O | 8자 이상 |
| confirmPassword | password | O | password와 일치 |

### 4.2 유효성 검증

**클라이언트 측:**
- 이메일: 형식 검증 (RFC 5322)
- 비밀번호: 8자 이상
- 비밀번호 확인: 비밀번호와 일치 여부

**서버 측:**
- 이메일 중복 확인
- 비밀번호 정책 검증

### 4.3 비밀번호 강도 표시

| 강도 | 조건 | 색상 |
|------|------|------|
| 약함 | 8자 미만 | 빨강 |
| 보통 | 8자 이상 + 2가지 이상 문자 조합 | 노랑 |
| 강함 | 10자 이상 + 3가지 이상 문자 조합 | 초록 |

### 4.4 에러 처리

| 에러 코드 | 메시지 | 처리 |
|-----------|--------|------|
| EMAIL_ALREADY_EXISTS | 이미 사용 중인 이메일입니다 | 폼 상단에 표시 |
| WEAK_PASSWORD | 비밀번호가 너무 약합니다 | 필드 에러로 표시 |
| VALIDATION_ERROR | 입력값 오류 | 필드별 에러 표시 |
| NETWORK_ERROR | 네트워크 오류 | 폼 상단에 표시 |

---

## 5. 상태 흐름

```mermaid
flowchart TD
    A[회원가입 페이지 접근] --> B{이미 로그인됨?}
    B -->|Yes| C[/rooms로 리다이렉트]
    B -->|No| D[회원가입 폼 표시]

    D --> E[이메일/비밀번호/확인 입력]
    E --> F[회원가입 버튼 클릭]
    F --> G{클라이언트 검증}

    G -->|실패| H[필드 에러 표시]
    H --> E

    G -->|성공| I[SIGNUP_START 디스패치]
    I --> J[API 호출]
    J --> K{응답 결과}

    K -->|성공| L[SIGNUP_SUCCESS 디스패치]
    L --> M[토큰 저장]
    M --> N[/rooms로 이동]

    K -->|실패| O[SIGNUP_FAILURE 디스패치]
    O --> P[에러 메시지 표시]
    P --> E
```

---

## 6. API 연동

### 6.1 회원가입 API

```typescript
// POST /api/auth/signup
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response (Success)
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": null,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Response (Failure - 이메일 중복)
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "이미 사용 중인 이메일입니다."
  }
}
```

---

## 7. 의존성 및 순서

### 7.1 의존성

- `@/contexts/AuthContext` - 인증 상태 관리
- `@/hooks/useAuth` - 인증 훅
- `@/components/ui/*` - UI 컴포넌트
- `@/components/layout/AuthLayout` - 인증 레이아웃
- `@/utils/validation.utils` - 유효성 검증 유틸

### 7.2 구현 순서

1. LoginForm 구현 완료 후 진행 (공통 컴포넌트 재사용)
2. SignupForm 컴포넌트 구현
3. 회원가입 페이지 조립
4. 회원가입 API 연동

---

## 8. 테스트 계획

### 8.1 단위 테스트

- 폼 입력값 변경 테스트
- 유효성 검증 테스트 (이메일, 비밀번호, 확인)
- 비밀번호 강도 계산 테스트
- 에러 표시 테스트

### 8.2 통합 테스트

- 회원가입 성공 시나리오
- 회원가입 실패 시나리오 (중복 이메일)
- 리다이렉트 테스트

### 8.3 테스트 파일

```
__tests__/
├── components/
│   └── auth/
│       └── SignupForm.test.tsx
└── pages/
    └── signup.test.tsx
```

---

## 9. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-23 | 최초 작성 |
