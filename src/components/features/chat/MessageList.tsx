'use client';

import { useEffect, useRef } from 'react';
import type { MessageWithReactions } from '@/types/domain/message.types';
import { MessageItem } from './MessageItem';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface MessageListProps {
  readonly messages: readonly MessageWithReactions[];
  readonly currentUserId: string;
  readonly isLoading: boolean;
  readonly onToggleReaction: (messageId: string) => void;
  readonly onToggleBookmark: (messageId: string) => void;
  readonly onDelete: (messageId: string) => void;
}

export const MessageList = ({
  messages,
  currentUserId,
  isLoading,
  onToggleReaction,
  onToggleBookmark,
  onDelete,
}: MessageListProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  // 새 메시지가 추가되면 자동 스크롤
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        title="메시지가 없습니다"
        description="첫 번째 메시지를 보내보세요!"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.userId === currentUserId}
          onToggleReaction={onToggleReaction}
          onToggleBookmark={onToggleBookmark}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
