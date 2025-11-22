# 상태관리 Context 구현 계획

## 1. 개요

Flux 패턴과 React Context API를 활용한 상태관리 구현 계획입니다. 이미 상세 설계 문서가 `docs/states/` 폴더에 존재하므로, 이 계획서는 구현 순서와 파일 구조에 집중합니다.

### 참조 문서
- `docs/states/README.md` - 전체 상태관리 설계
- `docs/states/auth-context.md` - AuthContext 상세 설계
- `docs/states/room-context.md` - RoomContext 상세 설계
- `docs/states/chat-context.md` - ChatContext 상세 설계
- `docs/states/bookmark-context.md` - BookmarkContext 상세 설계

---

## 2. 구현할 파일 목록

```
src/contexts/
├── AuthContext.tsx          # 인증 상태 관리
├── RoomContext.tsx          # 채팅방 목록 관리
├── ChatContext.tsx          # 채팅방 상세 (메시지, 리액션, 북마크)
├── BookmarkContext.tsx      # 북마크 목록 관리
└── index.ts                 # Context 내보내기

src/hooks/
├── useAuth.ts               # 인증 관련 훅
├── useRooms.ts              # 채팅방 목록 관련 훅
├── useChat.ts               # 채팅 관련 훅
├── useBookmarks.ts          # 북마크 관련 훅
└── index.ts                 # 훅 내보내기 (이미 존재)
```

---

## 3. 구현 상세

### 3.1 AuthContext 구현

`docs/states/auth-context.md` 문서를 기반으로 구현합니다.

**주요 기능:**
- 로그인/로그아웃/회원가입
- 세션 초기화 및 관리
- 인증 상태 확인

**파일: `src/contexts/AuthContext.tsx`**

```typescript
'use client';

import { createContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@/types/domain/user.types';

// === State ===
export interface AuthState {
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly isInitialized: boolean;
  readonly error: AuthError | null;
}

export interface AuthError {
  readonly code: AuthErrorCode;
  readonly message: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'INVALID_EMAIL'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// === Actions ===
export type AuthAction =
  | { readonly type: 'INITIALIZE_START' }
  | { readonly type: 'INITIALIZE_SUCCESS'; readonly payload: User | null }
  | { readonly type: 'INITIALIZE_FAILURE'; readonly payload: AuthError }
  | { readonly type: 'LOGIN_START' }
  | { readonly type: 'LOGIN_SUCCESS'; readonly payload: User }
  | { readonly type: 'LOGIN_FAILURE'; readonly payload: AuthError }
  | { readonly type: 'SIGNUP_START' }
  | { readonly type: 'SIGNUP_SUCCESS'; readonly payload: User }
  | { readonly type: 'SIGNUP_FAILURE'; readonly payload: AuthError }
  | { readonly type: 'LOGOUT_START' }
  | { readonly type: 'LOGOUT_SUCCESS' }
  | { readonly type: 'LOGOUT_FAILURE'; readonly payload: AuthError }
  | { readonly type: 'CLEAR_ERROR' }
  | { readonly type: 'SESSION_EXPIRED' };

// === Reducer ===
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE_START':
      return { ...state, isLoading: true, error: null };

    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    case 'INITIALIZE_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: action.payload,
      };

    case 'LOGIN_START':
    case 'SIGNUP_START':
    case 'LOGOUT_START':
      return { ...state, isLoading: true, error: null };

    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT_SUCCESS':
      return { ...initialAuthState, isInitialized: true };

    case 'LOGOUT_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SESSION_EXPIRED':
      return {
        ...initialAuthState,
        isInitialized: true,
        error: { code: 'SESSION_EXPIRED', message: '세션이 만료되었습니다.' },
      };

    default:
      return state;
  }
};

// === Context ===
export interface AuthContextValue {
  readonly state: AuthState;
  readonly actions: {
    readonly login: (email: string, password: string) => Promise<boolean>;
    readonly signup: (email: string, password: string) => Promise<boolean>;
    readonly logout: () => Promise<void>;
    readonly clearError: () => void;
  };
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// === Provider ===
interface AuthProviderProps {
  readonly children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // 초기 세션 확인
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      dispatch({ type: 'INITIALIZE_START' });

      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          dispatch({ type: 'INITIALIZE_SUCCESS', payload: null });
          return;
        }

        const response = await fetch('/api/auth/session', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const { data } = await response.json();
          dispatch({ type: 'INITIALIZE_SUCCESS', payload: data.user });
        } else {
          localStorage.removeItem('accessToken');
          dispatch({ type: 'INITIALIZE_SUCCESS', payload: null });
        }
      } catch {
        dispatch({
          type: 'INITIALIZE_FAILURE',
          payload: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' },
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const { success, data, error } = await response.json();

      if (success && data) {
        localStorage.setItem('accessToken', data.accessToken);
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        return true;
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: { code: error?.code ?? 'INVALID_CREDENTIALS', message: error?.message ?? '로그인에 실패했습니다.' },
        });
        return false;
      }
    } catch {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' },
      });
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SIGNUP_START' });

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const { success, data, error } = await response.json();

      if (success && data) {
        localStorage.setItem('accessToken', data.accessToken);
        dispatch({ type: 'SIGNUP_SUCCESS', payload: data.user });
        return true;
      } else {
        dispatch({
          type: 'SIGNUP_FAILURE',
          payload: { code: error?.code ?? 'UNKNOWN_ERROR', message: error?.message ?? '회원가입에 실패했습니다.' },
        });
        return false;
      }
    } catch {
      dispatch({
        type: 'SIGNUP_FAILURE',
        payload: { code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다.' },
      });
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    dispatch({ type: 'LOGOUT_START' });

    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      localStorage.removeItem('accessToken');
      dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch {
      localStorage.removeItem('accessToken');
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const contextValue: AuthContextValue = {
    state,
    actions: { login, signup, logout, clearError },
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
```

### 3.2 useAuth 훅

**파일: `src/hooks/useAuth.ts`**

```typescript
'use client';

import { useContext } from 'react';
import { AuthContext, AuthContextValue } from '@/contexts/AuthContext';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const useAuthState = () => useAuth().state;
export const useAuthActions = () => useAuth().actions;
export const useUser = () => useAuth().state.user;
export const useIsAuthenticated = () => useAuth().state.isAuthenticated;
```

### 3.3 RoomContext 구현

`docs/states/room-context.md` 문서 기반으로 구현합니다.

**주요 기능:**
- 채팅방 목록 조회
- 검색/필터링
- 채팅방 생성

### 3.4 ChatContext 구현

`docs/states/chat-context.md` 문서 기반으로 구현합니다.

**주요 기능:**
- 메시지 조회/전송/삭제
- 3초 주기 폴링
- 리액션/북마크 토글
- 낙관적 UI 업데이트

### 3.5 BookmarkContext 구현

`docs/states/bookmark-context.md` 문서 기반으로 구현합니다.

**주요 기능:**
- 북마크 목록 조회
- 북마크 해제
- 삭제된 메시지 처리

---

## 4. Context 인덱스 파일

**파일: `src/contexts/index.ts`**

```typescript
export { AuthContext, AuthProvider } from './AuthContext';
export type { AuthState, AuthError, AuthErrorCode, AuthContextValue } from './AuthContext';

export { RoomContext, RoomProvider } from './RoomContext';
export type { RoomState, RoomError, RoomErrorCode, RoomContextValue } from './RoomContext';

export { ChatContext, ChatProvider } from './ChatContext';
export type { ChatState, ChatError, ChatErrorCode, ChatContextValue } from './ChatContext';

export { BookmarkContext, BookmarkProvider } from './BookmarkContext';
export type { BookmarkState, BookmarkError, BookmarkErrorCode, BookmarkContextValue } from './BookmarkContext';
```

---

## 5. Provider 계층 구조

### 5.1 루트 레이아웃 (전역 Provider)

**파일: `src/app/layout.tsx`**

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 5.2 메인 레이아웃 (인증 필요 영역)

**파일: `src/app/(main)/layout.tsx`**

```typescript
import { RoomProvider } from '@/contexts/RoomContext';
import { BookmarkProvider } from '@/contexts/BookmarkContext';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RoomProvider>
        <BookmarkProvider>
          {children}
        </BookmarkProvider>
      </RoomProvider>
    </AuthGuard>
  );
}
```

### 5.3 채팅방 상세 레이아웃

**파일: `src/app/(main)/rooms/[roomId]/layout.tsx`**

```typescript
import { ChatProvider } from '@/contexts/ChatContext';

export default function RoomDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  );
}
```

---

## 6. AuthGuard 컴포넌트

**파일: `src/components/layout/AuthGuard.tsx`**

```typescript
'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  readonly children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps): JSX.Element | null => {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.isInitialized && !state.isAuthenticated) {
      router.replace('/login');
    }
  }, [state.isInitialized, state.isAuthenticated, router]);

  // 초기화 중
  if (!state.isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 미인증
  if (!state.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
```

---

## 7. 의존성 및 구현 순서

### 7.1 구현 순서

1. **AuthContext** (1단계)
   - `src/contexts/AuthContext.tsx`
   - `src/hooks/useAuth.ts`
   - `src/components/layout/AuthGuard.tsx`

2. **RoomContext** (2단계)
   - `src/contexts/RoomContext.tsx`
   - `src/hooks/useRooms.ts`

3. **ChatContext** (3단계)
   - `src/contexts/ChatContext.tsx`
   - `src/hooks/useChat.ts`

4. **BookmarkContext** (4단계)
   - `src/contexts/BookmarkContext.tsx`
   - `src/hooks/useBookmarks.ts`

5. **인덱스 및 Provider 연결** (5단계)
   - `src/contexts/index.ts`
   - 레이아웃 파일들 업데이트

### 7.2 의존성

```
AuthContext (전역)
    |
    v
RoomContext + BookmarkContext (메인 영역)
    |
    v
ChatContext (채팅방 상세)
```

---

## 8. 테스트 계획

### 8.1 단위 테스트

- Reducer 순수 함수 테스트
- Action creator 테스트

### 8.2 통합 테스트

- Provider + Hook 통합 테스트
- 상태 변화 시나리오 테스트

### 8.3 테스트 파일 구조

```
__tests__/
├── contexts/
│   ├── AuthContext.test.tsx
│   ├── RoomContext.test.tsx
│   ├── ChatContext.test.tsx
│   └── BookmarkContext.test.tsx
└── hooks/
    ├── useAuth.test.tsx
    ├── useRooms.test.tsx
    ├── useChat.test.tsx
    └── useBookmarks.test.tsx
```

---

## 9. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-23 | 최초 작성 |
