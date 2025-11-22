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

  // 개별 액션 함수 참조 추출 (안정적인 참조)
  const { fetchMessages, clearMessages, sendMessage: contextSendMessage } = actions;

  // 초기 메시지 로드
  useEffect(() => {
    if (enabled && roomId) {
      fetchMessages(roomId);
    }

    return () => {
      clearMessages();
    };
  }, [roomId, enabled, fetchMessages, clearMessages]);

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
        fetchMessages(roomId, state.lastMessageId);
      }
    }, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [roomId, enabled, state.lastMessageId, fetchMessages]);

  const sendMessage = useCallback(
    (content: string) => {
      return contextSendMessage(roomId, content);
    },
    [roomId, contextSendMessage]
  );

  const refresh = useCallback(() => {
    return fetchMessages(roomId);
  }, [roomId, fetchMessages]);

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
