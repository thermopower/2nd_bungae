'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Room } from '@/types/domain/room.types';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Spinner } from '@/components/ui/Spinner';

interface ChatRoomProps {
  readonly room: Room;
  readonly onLeave: () => Promise<void>;
}

export const ChatRoom = ({ room, onLeave }: ChatRoomProps): JSX.Element => {
  const router = useRouter();
  const { state: authState } = useAuth();
  const {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    deleteMessage,
    toggleReaction,
    toggleBookmark,
    clearError,
  } = useMessages({ roomId: room.id, enabled: true });

  const handleSend = useCallback(
    async (content: string) => {
      await sendMessage(content);
    },
    [sendMessage]
  );

  const handleDelete = useCallback(
    async (messageId: string) => {
      await deleteMessage(messageId);
    },
    [deleteMessage]
  );

  const handleLeave = useCallback(async () => {
    if (window.confirm('채팅방을 나가시겠습니까?')) {
      await onLeave();
      router.push('/rooms');
    }
  }, [onLeave, router]);

  if (!authState.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{room.name}</h1>
          {room.description && (
            <p className="text-sm text-gray-500">{room.description}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLeave}>
          나가기
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4">
          <ErrorMessage message={error} onRetry={clearError} />
        </div>
      )}

      {/* 메시지 목록 */}
      <MessageList
        messages={messages}
        currentUserId={authState.user.id}
        isLoading={isLoading}
        onToggleReaction={toggleReaction}
        onToggleBookmark={toggleBookmark}
        onDelete={handleDelete}
      />

      {/* 메시지 입력 */}
      <MessageInput onSend={handleSend} isSending={isSending} />
    </div>
  );
};
