'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import type { User } from '@/types/domain/user.types';
import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { ERROR_CODES } from '@/constants/error.constants';

// Token storage key
const TOKEN_KEY = 'auth_token';

// Token 유틸리티 함수
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// 인증 헤더 생성 헬퍼 (외부에서 사용)
export const getAuthHeaders = (): HeadersInit => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// State
interface AuthState {
  readonly user: User | null;
  readonly accessToken: string | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; accessToken: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Actions Interface
interface AuthActions {
  login: (email: string, password: string) => Promise<Result<User, string>>;
  signup: (email: string, password: string, passwordConfirm: string) => Promise<Result<User, string>>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Context
interface AuthContextValue {
  state: AuthState;
  actions: AuthActions;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Provider
interface AuthProviderProps {
  readonly children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(
    async (email: string, password: string): Promise<Result<User, string>> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      try {
        const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorCode = data.error?.code || ERROR_CODES.INVALID_CREDENTIALS;
          dispatch({ type: 'SET_ERROR', payload: errorCode });
          return err(errorCode);
        }

        const user = data.data.user as User;
        const accessToken = data.data.accessToken as string;
        setStoredToken(accessToken);
        dispatch({ type: 'SET_USER', payload: { user, accessToken } });
        return ok(user);
      } catch {
        dispatch({ type: 'SET_ERROR', payload: ERROR_CODES.NETWORK_ERROR });
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      passwordConfirm: string
    ): Promise<Result<User, string>> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      try {
        const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, passwordConfirm }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          dispatch({ type: 'SET_ERROR', payload: errorCode });
          return err(errorCode);
        }

        const user = data.data.user as User;
        const accessToken = data.data.accessToken as string;
        setStoredToken(accessToken);
        dispatch({ type: 'SET_USER', payload: { user, accessToken } });
        return ok(user);
      } catch {
        dispatch({ type: 'SET_ERROR', payload: ERROR_CODES.NETWORK_ERROR });
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      const token = getStoredToken();
      if (token) {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // 로그아웃은 실패해도 로컬 상태는 클리어
    } finally {
      removeStoredToken();
      dispatch({ type: 'CLEAR_USER' });
    }
  }, []);

  const checkAuth = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const token = getStoredToken();
      if (!token) {
        dispatch({ type: 'CLEAR_USER' });
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          dispatch({ type: 'SET_USER', payload: { user: data.data.user, accessToken: token } });
          return;
        }
      }
      removeStoredToken();
      dispatch({ type: 'CLEAR_USER' });
    } catch {
      removeStoredToken();
      dispatch({ type: 'CLEAR_USER' });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // 초기 인증 체크
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const actions: AuthActions = {
    login,
    signup,
    logout,
    checkAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={{ state, actions }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
