'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { Room, RoomWithMemberCount } from '@/types/domain/room.types';
import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { ERROR_CODES } from '@/constants/error.constants';
import { getAuthHeaders } from './AuthContext';

// State
interface RoomState {
  readonly rooms: readonly RoomWithMemberCount[];
  readonly currentRoom: Room | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  currentRoom: null,
  isLoading: false,
  error: null,
};

// Actions
type RoomAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ROOMS'; payload: readonly RoomWithMemberCount[] }
  | { type: 'SET_CURRENT_ROOM'; payload: Room | null }
  | { type: 'ADD_ROOM'; payload: RoomWithMemberCount }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Reducer
const roomReducer = (state: RoomState, action: RoomAction): RoomState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload, isLoading: false, error: null };
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Actions Interface
interface RoomActions {
  fetchRooms: (search?: string) => Promise<Result<readonly RoomWithMemberCount[], string>>;
  fetchRoom: (roomId: string) => Promise<Result<Room, string>>;
  createRoom: (name: string, description?: string, isPublic?: boolean) => Promise<Result<Room, string>>;
  joinRoom: (roomId: string) => Promise<Result<void, string>>;
  leaveRoom: (roomId: string) => Promise<Result<void, string>>;
  clearError: () => void;
}

// Context
interface RoomContextValue {
  state: RoomState;
  actions: RoomActions;
}

const RoomContext = createContext<RoomContextValue | null>(null);

// Provider
interface RoomProviderProps {
  readonly children: ReactNode;
}

export const RoomProvider = ({ children }: RoomProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(roomReducer, initialState);

  const fetchRooms = useCallback(
    async (search?: string): Promise<Result<readonly RoomWithMemberCount[], string>> => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const url = search
          ? `${API_ENDPOINTS.ROOMS.LIST}?search=${encodeURIComponent(search)}`
          : API_ENDPOINTS.ROOMS.LIST;

        const response = await fetch(url, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          dispatch({ type: 'SET_ERROR', payload: errorCode });
          return err(errorCode);
        }

        const rooms = data.data?.rooms as RoomWithMemberCount[] ?? [];
        dispatch({ type: 'SET_ROOMS', payload: rooms });
        return ok(rooms);
      } catch {
        dispatch({ type: 'SET_ERROR', payload: ERROR_CODES.NETWORK_ERROR });
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const fetchRoom = useCallback(
    async (roomId: string): Promise<Result<Room, string>> => {
      try {
        const response = await fetch(API_ENDPOINTS.ROOMS.DETAIL(roomId), {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorCode = data.error?.code || ERROR_CODES.ROOM_NOT_FOUND;
          return err(errorCode);
        }

        const room = data.data?.room as Room;
        dispatch({ type: 'SET_CURRENT_ROOM', payload: room });
        return ok(room);
      } catch {
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const createRoom = useCallback(
    async (
      name: string,
      description?: string,
      isPublic: boolean = true
    ): Promise<Result<Room, string>> => {
      try {
        const response = await fetch(API_ENDPOINTS.ROOMS.LIST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ name, description, isPublic }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          return err(errorCode);
        }

        const room = data.data?.room as Room;
        dispatch({
          type: 'ADD_ROOM',
          payload: { ...room, memberCount: 1 },
        });
        return ok(room);
      } catch {
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const joinRoom = useCallback(
    async (roomId: string): Promise<Result<void, string>> => {
      try {
        const response = await fetch(API_ENDPOINTS.ROOMS.JOIN(roomId), {
          method: 'POST',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          return err(errorCode);
        }

        return ok(undefined);
      } catch {
        return err(ERROR_CODES.NETWORK_ERROR);
      }
    },
    []
  );

  const leaveRoom = useCallback(
    async (roomId: string): Promise<Result<void, string>> => {
      try {
        const response = await fetch(API_ENDPOINTS.ROOMS.LEAVE(roomId), {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const data = await response.json();
          const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
          return err(errorCode);
        }

        dispatch({ type: 'SET_CURRENT_ROOM', payload: null });
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

  // actions 객체를 useMemo로 메모이제이션하여 불필요한 리렌더링 방지
  const actions: RoomActions = useMemo(
    () => ({
      fetchRooms,
      fetchRoom,
      createRoom,
      joinRoom,
      leaveRoom,
      clearError,
    }),
    [fetchRooms, fetchRoom, createRoom, joinRoom, leaveRoom, clearError]
  );

  // context value도 메모이제이션하여 안정적인 참조 유지
  const contextValue = useMemo(
    () => ({ state, actions }),
    [state, actions]
  );

  return (
    <RoomContext.Provider value={contextValue}>
      {children}
    </RoomContext.Provider>
  );
};

// Hook
export const useRoomContext = (): RoomContextValue => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
};
