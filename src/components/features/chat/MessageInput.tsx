'use client';

import { useState, useCallback, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';

interface MessageInputProps {
  readonly onSend: (content: string) => void;
  readonly isSending?: boolean;
  readonly disabled?: boolean;
  readonly maxLength?: number;
}

export const MessageInput = ({
  onSend,
  isSending = false,
  disabled = false,
  maxLength = 2000,
}: MessageInputProps): JSX.Element => {
  const [content, setContent] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = content.trim();
      if (trimmed && !isSending && !disabled) {
        onSend(trimmed);
        setContent('');
      }
    },
    [content, onSend, isSending, disabled]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit]
  );

  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요 (Shift+Enter: 줄바꿈)"
            disabled={disabled || isSending}
            maxLength={maxLength}
            rows={1}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          {content.length > 0 && (
            <span
              className={`absolute right-3 bottom-2 text-xs ${
                isOverLimit ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              {remainingChars}
            </span>
          )}
        </div>
        <Button
          type="submit"
          disabled={!content.trim() || isOverLimit || disabled}
          isLoading={isSending}
        >
          전송
        </Button>
      </div>
    </form>
  );
};
