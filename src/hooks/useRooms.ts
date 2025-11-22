'use client';

import { useCallback, useEffect } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';

/**
 * 채팅방 관련 훅
 */
export const useRooms = () => {
  const { state, actions } = useRoomContext();
  const { fetchRooms } = actions;

  // fetchRooms 함수만 dependency로 사용하여 무한 루프 방지
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const searchRooms = useCallback(
    (search: string) => {
      fetchRooms(search);
    },
    [fetchRooms]
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
