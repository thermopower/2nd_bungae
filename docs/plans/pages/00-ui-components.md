# 공통 UI 컴포넌트 구현 계획

## 1. 개요

재사용 가능한 공통 UI 컴포넌트 구현 계획입니다. 함수형 프로그래밍 원칙에 따라 순수 컴포넌트로 구현합니다.

---

## 2. 구현할 파일 목록

```
src/components/
├── ui/                          # 재사용 가능한 순수 UI 컴포넌트
│   ├── Button.tsx               # 버튼 컴포넌트
│   ├── Input.tsx                # 입력 필드 컴포넌트
│   ├── TextArea.tsx             # 텍스트 영역 컴포넌트
│   ├── Modal.tsx                # 모달 컴포넌트
│   ├── Card.tsx                 # 카드 컴포넌트
│   ├── Avatar.tsx               # 아바타 컴포넌트
│   ├── Badge.tsx                # 뱃지 컴포넌트
│   ├── Spinner.tsx              # 로딩 스피너
│   ├── EmptyState.tsx           # 빈 상태 표시
│   ├── ErrorMessage.tsx         # 에러 메시지
│   ├── Toast.tsx                # 토스트 알림
│   └── index.ts                 # 내보내기
├── layout/                      # 레이아웃 컴포넌트
│   ├── Header.tsx               # 헤더 컴포넌트
│   ├── MainLayout.tsx           # 메인 레이아웃
│   ├── AuthLayout.tsx           # 인증 페이지 레이아웃
│   ├── AuthGuard.tsx            # 인증 가드
│   └── index.ts                 # 내보내기
└── common/                      # 공통 컴포넌트
    ├── SearchBar.tsx            # 검색바
    ├── Pagination.tsx           # 페이지네이션
    └── index.ts                 # 내보내기
```

---

## 3. 상세 구현 내용

### 3.1 Button 컴포넌트

```typescript
// src/components/ui/Button.tsx
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const combinedClassName = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            로딩 중...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 3.2 Input 컴포넌트

```typescript
// src/components/ui/Input.tsx
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseInputStyles = 'w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
    const normalStyles = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500';

    const inputClassName = [
      baseInputStyles,
      error ? errorStyles : normalStyles,
      className,
    ].join(' ');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1.5 text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### 3.3 TextArea 컴포넌트

```typescript
// src/components/ui/TextArea.tsx
'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id ?? `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none';
    const normalStyles = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    const errorStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500';

    const textareaClassName = [
      baseStyles,
      error ? errorStyles : normalStyles,
      className,
    ].join(' ');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block mb-1.5 text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClassName}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
```

### 3.4 Modal 컴포넌트

```typescript
// src/components/ui/Modal.tsx
'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly children: ReactNode;
  readonly size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps): JSX.Element | null => {
  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeStyles[size]} bg-white rounded-lg shadow-xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
```

### 3.5 Card 컴포넌트

```typescript
// src/components/ui/Card.tsx
import { ReactNode } from 'react';

interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly onClick?: () => void;
  readonly hoverable?: boolean;
}

export const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps): JSX.Element => {
  const baseStyles = 'bg-white rounded-lg border border-gray-200 shadow-sm';
  const hoverStyles = hoverable ? 'hover:shadow-md hover:border-gray-300 transition-shadow cursor-pointer' : '';

  const combinedClassName = [baseStyles, hoverStyles, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName} onClick={onClick}>
      {children}
    </div>
  );
};

// Card 하위 컴포넌트
export const CardHeader = ({
  children,
  className = '',
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element => (
  <div className={`p-4 border-b border-gray-200 ${className}`}>{children}</div>
);

export const CardBody = ({
  children,
  className = '',
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element => (
  <div className={`p-4 ${className}`}>{children}</div>
);

export const CardFooter = ({
  children,
  className = '',
}: {
  readonly children: ReactNode;
  readonly className?: string;
}): JSX.Element => (
  <div className={`p-4 border-t border-gray-200 ${className}`}>{children}</div>
);
```

### 3.6 Avatar 컴포넌트

```typescript
// src/components/ui/Avatar.tsx
interface AvatarProps {
  readonly src?: string | null;
  readonly name?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

// 이름에서 이니셜 추출
const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// 이름 기반 배경색 생성
const getColorFromName = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const Avatar = ({
  src,
  name = '',
  size = 'md',
  className = '',
}: AvatarProps): JSX.Element => {
  const baseStyles = 'rounded-full flex items-center justify-center font-medium';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${baseStyles} ${sizeStyles[size]} object-cover ${className}`}
      />
    );
  }

  const bgColor = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${bgColor} text-white ${className}`}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
```

### 3.7 Badge 컴포넌트

```typescript
// src/components/ui/Badge.tsx
import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  readonly children: ReactNode;
  readonly variant?: BadgeVariant;
  readonly className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
};

export const Badge = ({
  children,
  variant = 'default',
  className = '',
}: BadgeProps): JSX.Element => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
```

### 3.8 Spinner 컴포넌트

```typescript
// src/components/ui/Spinner.tsx
interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps): JSX.Element => (
  <svg
    className={`animate-spin ${sizeStyles[size]} ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-label="로딩 중"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// 전체 화면 로딩
export const FullScreenSpinner = (): JSX.Element => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
    <Spinner size="lg" className="text-blue-600" />
  </div>
);
```

### 3.9 EmptyState 컴포넌트

```typescript
// src/components/ui/EmptyState.tsx
import { ReactNode } from 'react';

interface EmptyStateProps {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps): JSX.Element => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {icon && <div className="mb-4 text-gray-400">{icon}</div>}
    <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
    )}
    {action && <div>{action}</div>}
  </div>
);
```

### 3.10 ErrorMessage 컴포넌트

```typescript
// src/components/ui/ErrorMessage.tsx
interface ErrorMessageProps {
  readonly message: string;
  readonly onRetry?: () => void;
  readonly className?: string;
}

export const ErrorMessage = ({
  message,
  onRetry,
  className = '',
}: ErrorMessageProps): JSX.Element => (
  <div
    className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    role="alert"
  >
    <div className="flex items-start gap-3">
      <svg
        className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <p className="text-sm text-red-800">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  </div>
);
```

---

## 4. 레이아웃 컴포넌트

### 4.1 Header 컴포넌트

```typescript
// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export const Header = (): JSX.Element => {
  const router = useRouter();
  const { state, actions } = useAuth();

  const handleLogout = async () => {
    await actions.logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={state.isAuthenticated ? '/rooms' : '/'} className="flex items-center">
            <span className="text-xl font-bold text-blue-600">ChatApp</span>
          </Link>

          {/* Navigation */}
          {state.isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/rooms"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                채팅방
              </Link>
              <Link
                href="/bookmarks"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                북마크
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {state.isAuthenticated && state.user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <Avatar name={state.user.email} size="sm" />
                  <span className="text-sm text-gray-700">
                    {state.user.nickname ?? state.user.email}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
```

### 4.2 MainLayout 컴포넌트

```typescript
// src/components/layout/MainLayout.tsx
import { ReactNode } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  readonly children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps): JSX.Element => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  </div>
);
```

### 4.3 AuthLayout 컴포넌트

```typescript
// src/components/layout/AuthLayout.tsx
import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly subtitle?: string;
}

export const AuthLayout = ({
  children,
  title,
  subtitle,
}: AuthLayoutProps): JSX.Element => (
  <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <Link href="/" className="flex justify-center">
        <span className="text-3xl font-bold text-blue-600">ChatApp</span>
      </Link>
      <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
      )}
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {children}
      </div>
    </div>
  </div>
);
```

---

## 5. 인덱스 파일

### 5.1 UI 컴포넌트 인덱스

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { TextArea } from './TextArea';
export { Modal } from './Modal';
export { Card, CardHeader, CardBody, CardFooter } from './Card';
export { Avatar } from './Avatar';
export { Badge } from './Badge';
export { Spinner, FullScreenSpinner } from './Spinner';
export { EmptyState } from './EmptyState';
export { ErrorMessage } from './ErrorMessage';
```

### 5.2 레이아웃 컴포넌트 인덱스

```typescript
// src/components/layout/index.ts
export { Header } from './Header';
export { MainLayout } from './MainLayout';
export { AuthLayout } from './AuthLayout';
export { AuthGuard } from './AuthGuard';
```

---

## 6. 의존성 및 구현 순서

### 6.1 구현 순서

1. **기본 UI 컴포넌트** (1단계)
   - Button, Input, TextArea
   - Spinner, ErrorMessage

2. **복합 UI 컴포넌트** (2단계)
   - Modal, Card
   - Avatar, Badge
   - EmptyState

3. **레이아웃 컴포넌트** (3단계)
   - Header, MainLayout, AuthLayout
   - AuthGuard

4. **인덱스 파일** (4단계)
   - 내보내기 정리

### 6.2 스타일링

- Tailwind CSS 유틸리티 클래스 사용
- 일관된 색상 팔레트 (blue-600 기본 색상)
- 반응형 디자인 고려

---

## 7. 테스트 계획

### 7.1 단위 테스트

- 각 컴포넌트 렌더링 테스트
- Props 변화에 따른 스타일 테스트
- 이벤트 핸들러 테스트

### 7.2 접근성 테스트

- ARIA 속성 확인
- 키보드 네비게이션 테스트
- 스크린 리더 호환성

### 7.3 테스트 파일 구조

```
__tests__/
└── components/
    ├── ui/
    │   ├── Button.test.tsx
    │   ├── Input.test.tsx
    │   └── Modal.test.tsx
    └── layout/
        ├── Header.test.tsx
        └── AuthGuard.test.tsx
```

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-23 | 최초 작성 |
