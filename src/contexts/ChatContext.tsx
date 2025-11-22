'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import type { MessageWithReactions } from '@/types/domain/message.types';
import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { ERROR_CODES } from '@/constants/error.constants';
import { getAuthHeaders } from './AuthContext';

// State
interface ChatState {
  readonly messages: readonly MessageWithReactions[];
  readonly lastMessageId: string | null;
  readonly isLoading: boolean;
  readonly isSending: boolean;
  readonly error: string | null;
}

const initialState: ChatState = {
  messages: [],
  lastMessageId: null,
  isLoading: false,
  isSending: false,
  error: null,
};

// Actions
type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SENDING'; payload: boolean }
  | { type: 'SET_MESSAGES'; payload: readonly MessageWithReactions[] }
  | { type: 'ADD_MESSAGES'; payload: readonly MessageWithReactions[] }
  | { type: 'ADD_MESSAGE'; payload: MessageWithReactions }
  | { type: 'REMOVE_MESSAGE'; payload: string }
  | { type: 'UPDATE_REACTION'; payload: { messageId: string; hasReacted: boolean; reactionCount: number } }
  | { type: 'UPDATE_BOOKMARK'; payload: { messageId: string; hasBookmarked: boolean } }
  | { type: 'SET_LAST_MESSAGE_ID'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_MESSAGES' };

// Reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SENDING':
      return { ...state, isSending: action.payload };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
        lastMessageId: action.payload.length > 0 ? action.payload[action.payload.length - 1].id : null,
        isLoading: false,
        error: null,
      };
    case 'ADD_MESSAGES':
      return {
        ...state,
        messages: [...state.messages, ...action.payload],
        lastMessageId: action.payload.length > 0 ? action.payload[action.payload.length - 1].id : state.lastMessageId,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        lastMessageId: action.payload.id,
        isSending: false,
      };
    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter((m) => m.id !== action.payload),
      };
    case 'UPDATE_REACTION':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.messageId
            ? { ...m, hasReacted: action.payload.hasReacted, reactionCount: action.payload.reactionCount }
            : m
        ),
      };
    case 'UPDATE_BOOKMARK':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.messageId
            ? { ...m, hasBookmarked: action.payload.hasBookmarked }
            : m
        ),
      };
    case 'SET_LAST_MESSAGE_ID':
      return { ...state, lastMessageId: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isSending: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'CLEAR_MESSAGES':
      return { ...initialState };
    default:
      return state;
  }
};

// Actions Interface
interface ChatActions {
  fetchMessages: (roomId: string, after?: string) => Promise<Result<readonly MessageWithReactions[], string>>;
  sendMessage: (roomId: string, content: string) => Promise<Result<MessageWithReactions, string>>;
  deleteMessage: (messageId: string) => Promise<Result<void, string>>;
  toggleReaction: (messageId: string) => Promise<Result<void, string>>;
  toggleBookmark: (messageId: string) => Promise<Result<void, string>>;
  clearMessages: () => void;
  clearError: () => void;
}

// Context
interface ChatContextValue {
  state: ChatState;
  actions: ChatActions;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// Provider
interface ChatProviderProps {
  readonly children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const fetchMessages = useCallback(
    async (roomId: string, after?: string): Promise<Result<readonly MessageWithReactions[], string>> => {
      if (!after) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }

      try {
        const url = after
          ? `${API_ENDPOINTS.ROOMS.MESSAGES(roomId)}?after=${after}`
          : API_ENDPOINTS.ROOMS.MESSAGES(roomId);

        const response = await fetch(url, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (!response.ok) {
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          dispatch({ type: 'SET_ERROR', payload: errorCode });
          return err(errorCode);
        }

        const messages = data.data?.items as MessageWithReactions[] || [];

        if (after) {
          dispatch({ type: 'ADD_MESSAGES', payload: messages });
        } else {
          dispatch({ type: 'SET_MESSAGES', payload: messages });
        }

        return ok(messages);
      } catch {
        dispatch({ type: 'SET_ERROR', payload: ERROR_CODES.NETWORK_ERROR });
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (roomId: string, content: string): Promise<Result<MessageWithReactions, string>> => {
      dispatch({ type: 'SET_SENDING', payload: true });

      try {
        const response = await fetch(API_ENDPOINTS.ROOMS.MESSAGES(roomId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ content }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          dispatch({ type: 'SET_ERROR', payload: errorCode });
          return err(errorCode);
        }

        const message = data.data as MessageWithReactions;
        dispatch({ type: 'ADD_MESSAGE', payload: message });
        return ok(message);
      } catch {
        dispatch({ type: 'SET_ERROR', payload: ERROR_CODES.NETWORK_ERROR });
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const deleteMessage = useCallback(
    async (messageId: string): Promise<Result<void, string>> => {
      try {
        const response = await fetch(API_ENDPOINTS.MESSAGES.DELETE(messageId), {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          return err(errorCode);
        }

        dispatch({ type: 'REMOVE_MESSAGE', payload: messageId });
        return ok(undefined);
      } catch {
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const toggleReaction = useCallback(
    async (messageId: string): Promise<Result<void, string>> => {
      try {
        const response = await fetch(API_ENDPOINTS.MESSAGES.REACTIONS(messageId), {
          method: 'POST',
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          return err(errorCode);
        }

        dispatch({
          type: 'UPDATE_REACTION',
          payload: {
            messageId,
            hasReacted: data.data.hasReacted,
            reactionCount: data.data.reactionCount,
          },
        });
        return ok(undefined);
      } catch {
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const toggleBookmark = useCallback(
    async (messageId: string): Promise<Result<void, string>> => {
      try {
        const response = await fetch(API_ENDPOINTS.MESSAGES.BOOKMARKS(messageId), {
          method: 'POST',
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          return err(errorCode);
        }

        dispatch({
          type: 'UPDATE_BOOKMARK',
          payload: {
            messageId,
            hasBookmarked: data.data.hasBookmarked,
          },
        });
        return ok(undefined);
      } catch {
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const actions: ChatActions = {
    fetchMessages,
    sendMessage,
    deleteMessage,
    toggleReaction,
    toggleBookmark,
    clearMessages,
    clearError,
  };

  return (
    <ChatContext.Provider value={{ state, actions }}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook
export const useChatContext = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
