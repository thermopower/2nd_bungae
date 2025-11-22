'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { POLLING_INTERVAL } from '@/constants/polling.constants';

interface UseMessagesOptions {
  roomId: string;
  enabled?: boolean;
}

/**
 * 메시지 관련 훅
 * 폴링을 통한 메시지 동기화를 포함
 */
export const useMessages = ({ roomId, enabled = true }: UseMessagesOptions) => {
  const { state, actions } = useChatContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 초기 메시지 로드
  useEffect(() => {
    if (enabled && roomId) {
      actions.fetchMessages(roomId);
    }

    return () => {
      actions.clearMessages();
    };
  }, [roomId, enabled, actions]);

  // 폴링
  useEffect(() => {
    if (!enabled || !roomId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (state.lastMessageId) {
        actions.fetchMessages(roomId, state.lastMessageId);
      }
    }, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [roomId, enabled, state.lastMessageId, actions]);

  const sendMessage = useCallback(
    (content: string) => {
      return actions.sendMessage(roomId, content);
    },
    [roomId, actions]
  );

  const refresh = useCallback(() => {
    return actions.fetchMessages(roomId);
  }, [roomId, actions]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,
    sendMessage,
    deleteMessage: actions.deleteMessage,
    toggleReaction: actions.toggleReaction,
    toggleBookmark: actions.toggleBookmark,
    refresh,
    clearError: actions.clearError,
  };
};
