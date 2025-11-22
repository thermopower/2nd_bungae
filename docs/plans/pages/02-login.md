# 로그인 페이지 구현 계획

## 1. 개요

이메일/비밀번호 기반 로그인 페이지입니다.

### 페이지 정보
- **경로**: `/login`
- **인증 필요**: X (공개 페이지)
- **상태관리**: AuthContext (로그인 처리)

---

## 2. 구현할 파일 목록

```
src/app/(auth)/
├── login/
│   └── page.tsx                 # 로그인 페이지
└── layout.tsx                   # 인증 페이지 레이아웃

src/components/features/auth/
├── LoginForm.tsx                # 로그인 폼 컴포넌트
└── index.ts                     # 내보내기
```

---

## 3. 상세 구현 내용

### 3.1 인증 페이지 레이아웃 (app/(auth)/layout.tsx)

```typescript
// src/app/(auth)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from '@/components/layout/AuthLayout';

export default function AuthPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { state } = useAuth();

  // 이미 로그인된 사용자는 채팅방 목록으로 리다이렉트
  useEffect(() => {
    if (state.isInitialized && state.isAuthenticated) {
      router.replace('/rooms');
    }
  }, [state.isInitialized, state.isAuthenticated, router]);

  // 초기화 중
  if (!state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 이미 인증됨
  if (state.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### 3.2 로그인 페이지 (app/(auth)/login/page.tsx)

```typescript
// src/app/(auth)/login/page.tsx
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/components/features/auth/LoginForm';

export const metadata = {
  title: '로그인 - ChatApp',
  description: 'ChatApp에 로그인하세요',
};

export default function LoginPage(): JSX.Element {
  return (
    <AuthLayout
      title="로그인"
      subtitle="계정에 로그인하여 채팅을 시작하세요"
    >
      <LoginForm />
    </AuthLayout>
  );
}
```

### 3.3 로그인 폼 컴포넌트 (LoginForm.tsx)

```typescript
// src/components/features/auth/LoginForm.tsx
'use client';

import { useState, FormEvent, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { isValidEmail } from '@/utils/validation.utils';

interface FormState {
  readonly email: string;
  readonly password: string;
}

interface FormErrors {
  readonly email?: string;
  readonly password?: string;
}

const initialFormState: FormState = {
  email: '',
  password: '',
};

export const LoginForm = (): JSX.Element => {
  const router = useRouter();
  const { state, actions } = useAuth();

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // 입력값 변경 핸들러
  const handleChange = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
      // 입력 시 해당 필드의 에러 초기화
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      // 전역 에러 초기화
      if (state.error) {
        actions.clearError();
      }
    },
    [state.error, actions]
  );

  // 클라이언트 측 유효성 검증
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formState.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!isValidEmail(formState.email)) {
      errors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    if (!formState.password) {
      errors.password = '비밀번호를 입력해주세요.';
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

      const success = await actions.login(formState.email, formState.password);

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
      <Input
        type="password"
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        value={formState.password}
        onChange={handleChange('password')}
        error={formErrors.password}
        disabled={state.isLoading}
        autoComplete="current-password"
      />

      {/* 로그인 버튼 */}
      <Button
        type="submit"
        fullWidth
        isLoading={state.isLoading}
        disabled={!formState.email || !formState.password}
      >
        로그인
      </Button>

      {/* 회원가입 링크 */}
      <p className="text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link
          href="/signup"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          회원가입
        </Link>
      </p>
    </form>
  );
};
```

---

## 4. 기능 요구사항

### 4.1 입력 필드
| 필드 | 타입 | 필수 | 검증 |
|------|------|------|------|
| email | email | O | 이메일 형식 검증 |
| password | password | O | 빈 값 검증 |

### 4.2 유효성 검증

**클라이언트 측:**
- 이메일: 형식 검증 (RFC 5322)
- 비밀번호: 빈 값 검증

**서버 측:**
- 이메일/비밀번호 일치 여부
- 계정 존재 여부

### 4.3 에러 처리

| 에러 코드 | 메시지 | 처리 |
|-----------|--------|------|
| INVALID_CREDENTIALS | 이메일 또는 비밀번호가 올바르지 않습니다 | 폼 상단에 표시 |
| NETWORK_ERROR | 네트워크 오류가 발생했습니다 | 폼 상단에 표시 + 재시도 버튼 |
| VALIDATION_ERROR | 입력값 오류 | 필드별 에러 표시 |

---

## 5. 상태 흐름

```mermaid
flowchart TD
    A[로그인 페이지 접근] --> B{이미 로그인됨?}
    B -->|Yes| C[/rooms로 리다이렉트]
    B -->|No| D[로그인 폼 표시]

    D --> E[이메일/비밀번호 입력]
    E --> F[로그인 버튼 클릭]
    F --> G{클라이언트 검증}

    G -->|실패| H[필드 에러 표시]
    H --> E

    G -->|성공| I[LOGIN_START 디스패치]
    I --> J[API 호출]
    J --> K{응답 결과}

    K -->|성공| L[LOGIN_SUCCESS 디스패치]
    L --> M[토큰 저장]
    M --> N[/rooms로 이동]

    K -->|실패| O[LOGIN_FAILURE 디스패치]
    O --> P[에러 메시지 표시]
    P --> E
```

---

## 6. API 연동

### 6.1 로그인 API

```typescript
// POST /api/auth/login
// Request
{
  "email": "user@example.com",
  "password": "password123"
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

// Response (Failure)
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다."
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

1. AuthContext 및 useAuth 훅 구현
2. AuthLayout 컴포넌트 구현
3. UI 컴포넌트 구현 (Input, Button, ErrorMessage)
4. LoginForm 컴포넌트 구현
5. 로그인 페이지 조립
6. 인증 API 연동

---

## 8. 테스트 계획

### 8.1 단위 테스트

- 폼 입력값 변경 테스트
- 유효성 검증 테스트
- 에러 표시 테스트

### 8.2 통합 테스트

- 로그인 성공 시나리오
- 로그인 실패 시나리오
- 리다이렉트 테스트

### 8.3 테스트 파일

```
__tests__/
├── components/
│   └── auth/
│       └── LoginForm.test.tsx
└── pages/
    └── login.test.tsx
```

---

## 9. 접근성

- 폼 필드에 적절한 label 연결
- 에러 메시지에 aria-invalid, aria-describedby 사용
- 키보드 네비게이션 지원
- 포커스 관리 (자동 포커스, 에러 시 해당 필드로 포커스)

---

## 10. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-23 | 최초 작성 |
