import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoomProvider } from '@/contexts/RoomContext';
import { ChatProvider } from '@/contexts/ChatContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatApp - 실시간 채팅',
  description: '폴링 기반 실시간 채팅 애플리케이션',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <RoomProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </RoomProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
