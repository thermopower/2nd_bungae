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
