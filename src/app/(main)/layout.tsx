'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';
import { MainLayout } from '@/components/layout/MainLayout';

interface MainLayoutWrapperProps {
  children: React.ReactNode;
}

export default function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
