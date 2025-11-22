'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import type { BookmarkWithMessage } from '@/types/domain/bookmark.types';
import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { ERROR_CODES } from '@/constants/error.constants';
import { getAuthHeaders } from './AuthContext';

// State
interface BookmarkState {
  readonly bookmarks: readonly BookmarkWithMessage[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: BookmarkState = {
  bookmarks: [],
  isLoading: false,
  error: null,
};

// Actions
type BookmarkAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BOOKMARKS'; payload: readonly BookmarkWithMessage[] }
  | { type: 'REMOVE_BOOKMARK'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Reducer
const bookmarkReducer = (state: BookmarkState, action: BookmarkAction): BookmarkState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BOOKMARKS':
      return { ...state, bookmarks: action.payload, isLoading: false, error: null };
    case 'REMOVE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.filter((b) => b.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Actions Interface
interface BookmarkActions {
  fetchBookmarks: () => Promise<Result<readonly BookmarkWithMessage[], string>>;
  removeBookmark: (bookmarkId: string) => Promise<Result<void, string>>;
  clearError: () => void;
}

// Context
interface BookmarkContextValue {
  state: BookmarkState;
  actions: BookmarkActions;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

// Provider
interface BookmarkProviderProps {
  readonly children: ReactNode;
}

export const BookmarkProvider = ({ children }: BookmarkProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(bookmarkReducer, initialState);

  const fetchBookmarks = useCallback(
    async (): Promise<Result<readonly BookmarkWithMessage[], string>> => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const response = await fetch(API_ENDPOINTS.BOOKMARKS.LIST, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          dispatch({ type: 'SET_ERROR', payload: errorCode });
          return err(errorCode);
        }

        const bookmarks = data.data?.bookmarks as BookmarkWithMessage[] ?? [];
        dispatch({ type: 'SET_BOOKMARKS', payload: bookmarks });
        return ok(bookmarks);
      } catch {
        dispatch({ type: 'SET_ERROR', payload: ERROR_CODES.NETWORK_ERROR });
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const removeBookmark = useCallback(
    async (bookmarkId: string): Promise<Result<void, string>> => {
      try {
        const response = await fetch(API_ENDPOINTS.BOOKMARKS.DELETE(bookmarkId), {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          return err(errorCode);
        }

        dispatch({ type: 'REMOVE_BOOKMARK', payload: bookmarkId });
        return ok(undefined);
      } catch {
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const actions: BookmarkActions = {
    fetchBookmarks,
    removeBookmark,
    clearError,
  };

  return (
    <BookmarkContext.Provider value={{ state, actions }}>
      {children}
    </BookmarkContext.Provider>
  );
};

// Hook
export const useBookmarkContext = (): BookmarkContextValue => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarkContext must be used within a BookmarkProvider');
  }
  return context;
};
