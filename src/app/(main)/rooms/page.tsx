'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRooms } from '@/hooks/useRooms';
import { RoomList } from '@/components/features/room/RoomList';
import { CreateRoomModal } from '@/components/features/room/CreateRoomModal';
import { SearchBar } from '@/components/common/SearchBar';
import { Button } from '@/components/ui/Button';
import { isOk } from '@/utils/result.utils';

export default function RoomsPage() {
  const router = useRouter();
  const { rooms, isLoading, error, searchRooms, createRoom, fetchRooms, clearError } = useRooms();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = useCallback((query: string) => {
    searchRooms(query);
  }, [searchRooms]);

  const handleCreateRoom = useCallback(
    async (name: string, description?: string, isPublic?: boolean) => {
      setIsCreating(true);
      setCreateError(null);

      const result = await createRoom(name, description, isPublic);

      if (isOk(result)) {
        setIsCreateModalOpen(false);
        router.push(`/rooms/${result.data.id}`);
      } else {
        setCreateError(result.error);
      }

      setIsCreating(false);
    },
    [createRoom, router]
  );

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateError(null);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">채팅방</h1>
          <p className="text-gray-600">원하는 채팅방에 참여하거나 새로운 방을 만들어보세요.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          채팅방 만들기
        </Button>
      </div>

      {/* 검색바 */}
      <SearchBar
        placeholder="채팅방 검색..."
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {/* 채팅방 목록 */}
      <RoomList
        rooms={rooms}
        isLoading={isLoading}
        error={error}
        onRetry={() => fetchRooms()}
        onCreateRoom={() => setIsCreateModalOpen(true)}
      />

      {/* 채팅방 생성 모달 */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateRoom}
        isLoading={isCreating}
        error={createError}
      />
    </div>
  );
}
