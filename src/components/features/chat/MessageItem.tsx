'use client';

import type { MessageWithReactions } from '@/types/domain/message.types';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/utils/date.utils';

interface MessageItemProps {
  readonly message: MessageWithReactions;
  readonly isOwn: boolean;
  readonly onToggleReaction: (messageId: string) => void;
  readonly onToggleBookmark: (messageId: string) => void;
  readonly onDelete: (messageId: string) => void;
}

export const MessageItem = ({
  message,
  isOwn,
  onToggleReaction,
  onToggleBookmark,
  onDelete,
}: MessageItemProps): JSX.Element => {
  const handleReaction = () => onToggleReaction(message.id);
  const handleBookmark = () => onToggleBookmark(message.id);
  const handleDelete = () => {
    if (window.confirm('메시지를 삭제하시겠습니까?')) {
      onDelete(message.id);
    }
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar
        name={message.author.nickname || '사용자'}
        size="sm"
        className="flex-shrink-0"
      />
      <div className={`flex-1 max-w-[70%] ${isOwn ? 'flex flex-col items-end' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {message.author.nickname || '사용자'}
          </span>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(message.createdAt)}
          </span>
        </div>
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {/* 좋아요 버튼 */}
          <button
            onClick={handleReaction}
            className={`flex items-center gap-1 text-xs transition-colors ${
              message.hasReacted
                ? 'text-red-500'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <svg className="w-4 h-4" fill={message.hasReacted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {message.reactionCount > 0 && <span>{message.reactionCount}</span>}
          </button>

          {/* 북마크 버튼 */}
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1 text-xs transition-colors ${
              message.hasBookmarked
                ? 'text-yellow-500'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <svg className="w-4 h-4" fill={message.hasBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* 삭제 버튼 (본인 메시지만) */}
          {isOwn && (
            <button
              onClick={handleDelete}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
