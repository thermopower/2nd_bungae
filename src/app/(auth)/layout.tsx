'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FullScreenSpinner } from '@/components/ui/Spinner';

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AuthLayoutWrapper({ children }: AuthLayoutWrapperProps) {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (!state.isLoading && state.isAuthenticated) {
      router.push('/rooms');
    }
  }, [state.isLoading, state.isAuthenticated, router]);

  if (state.isLoading) {
    return <FullScreenSpinner />;
  }

  if (state.isAuthenticated) {
    return <FullScreenSpinner />;
  }

  return <>{children}</>;
}
