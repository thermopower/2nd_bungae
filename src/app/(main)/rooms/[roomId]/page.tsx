'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRooms } from '@/hooks/useRooms';
import { ChatRoom } from '@/components/features/chat/ChatRoom';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';
import { isOk } from '@/utils/result.utils';
import type { Room } from '@/types/domain/room.types';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const { fetchRoom, joinRoom, leaveRoom } = useRooms();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoom = async () => {
      setIsLoading(true);
      setError(null);

      // 먼저 방에 참여 시도
      const joinResult = await joinRoom(roomId);
      if (!isOk(joinResult) && joinResult.error !== 'ALREADY_MEMBER') {
        setError(joinResult.error);
        setIsLoading(false);
        return;
      }

      // 방 정보 조회
      const roomResult = await fetchRoom(roomId);
      if (isOk(roomResult)) {
        setRoom(roomResult.data);
      } else {
        setError(roomResult.error);
      }
      setIsLoading(false);
    };

    loadRoom();
  }, [roomId, fetchRoom, joinRoom]);

  const handleLeave = useCallback(async () => {
    await leaveRoom(roomId);
  }, [roomId, leaveRoom]);

  const handleRetry = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await fetchRoom(roomId);
    if (isOk(result)) {
      setRoom(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [roomId, fetchRoom]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-4">
        <ErrorMessage message={error} onRetry={handleRetry} />
        <Button variant="secondary" onClick={() => router.push('/rooms')}>
          채팅방 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-4">
        <p className="text-gray-600">채팅방을 찾을 수 없습니다.</p>
        <Button variant="secondary" onClick={() => router.push('/rooms')}>
          채팅방 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return <ChatRoom room={room} onLeave={handleLeave} />;
}
