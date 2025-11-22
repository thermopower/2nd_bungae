'use client';

import { useAuthContext } from '@/contexts/AuthContext';

/**
 * 인증 관련 훅
 * AuthContext를 편리하게 사용하기 위한 래퍼 훅
 */
export const useAuth = () => {
  const { state, actions } = useAuthContext();
  return { state, actions };
};
