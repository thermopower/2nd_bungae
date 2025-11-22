'use client';

import { useRouter } from 'next/navigation';
import type { RoomWithMemberCount } from '@/types/domain/room.types';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/utils/date.utils';

interface RoomCardProps {
  readonly room: RoomWithMemberCount;
}

export const RoomCard = ({ room }: RoomCardProps): JSX.Element => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/rooms/${room.id}`);
  };

  return (
    <Card hoverable onClick={handleClick}>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {room.name}
              </h3>
              {room.isPublic ? (
                <Badge variant="success">공개</Badge>
              ) : (
                <Badge variant="default">비공개</Badge>
              )}
            </div>
            {room.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {room.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {room.memberCount}명
              </span>
              <span>{formatRelativeTime(room.createdAt)}</span>
            </div>
          </div>
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </CardBody>
    </Card>
  );
};
