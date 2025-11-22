'use client';

import { useCallback, useEffect } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';

/**
 * 채팅방 관련 훅
 */
export const useRooms = () => {
  const { state, actions } = useRoomContext();

  useEffect(() => {
    actions.fetchRooms();
  }, [actions]);

  const searchRooms = useCallback(
    (search: string) => {
      actions.fetchRooms(search);
    },
    [actions]
  );

  return {
    rooms: state.rooms,
    currentRoom: state.currentRoom,
    isLoading: state.isLoading,
    error: state.error,
    fetchRooms: actions.fetchRooms,
    searchRooms,
    fetchRoom: actions.fetchRoom,
    createRoom: actions.createRoom,
    joinRoom: actions.joinRoom,
    leaveRoom: actions.leaveRoom,
    clearError: actions.clearError,
  };
};
