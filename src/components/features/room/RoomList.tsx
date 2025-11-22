'use client';

import type { RoomWithMemberCount } from '@/types/domain/room.types';
import { RoomCard } from './RoomCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';

interface RoomListProps {
  readonly rooms: readonly RoomWithMemberCount[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly onRetry?: () => void;
  readonly onCreateRoom?: () => void;
}

export const RoomList = ({
  rooms,
  isLoading,
  error,
  onRetry,
  onCreateRoom,
}: RoomListProps): JSX.Element => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={onRetry}
        className="my-4"
      />
    );
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        title="채팅방이 없습니다"
        description="새로운 채팅방을 만들어 대화를 시작해보세요."
        action={
          onCreateRoom && (
            <Button onClick={onCreateRoom}>
              채팅방 만들기
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
};
