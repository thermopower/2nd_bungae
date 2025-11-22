'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FullScreenSpinner } from '@/components/ui/Spinner';

interface AuthGuardProps {
  readonly children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps): JSX.Element => {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/login');
    }
  }, [state.isLoading, state.isAuthenticated, router]);

  if (state.isLoading) {
    return <FullScreenSpinner />;
  }

  if (!state.isAuthenticated) {
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
};
