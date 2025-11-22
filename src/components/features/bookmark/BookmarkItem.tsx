'use client';

import { useRouter } from 'next/navigation';
import type { BookmarkWithMessage } from '@/types/domain/bookmark.types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/utils/date.utils';

interface BookmarkItemProps {
  readonly bookmark: BookmarkWithMessage;
  readonly onRemove: (bookmarkId: string) => void;
}

export const BookmarkItem = ({ bookmark, onRemove }: BookmarkItemProps): JSX.Element => {
  const router = useRouter();
  const isDeleted = bookmark.message.deletedAt !== null;

  const handleGoToMessage = () => {
    if (!isDeleted) {
      router.push(`/rooms/${bookmark.message.room.id}`);
    }
  };

  const handleRemove = () => {
    onRemove(bookmark.id);
  };

  return (
    <Card className={isDeleted ? 'opacity-60' : ''}>
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-600">
                {bookmark.message.room.name}
              </span>
              {isDeleted && <Badge variant="danger">삭제됨</Badge>}
            </div>
            <p className={`text-sm ${isDeleted ? 'text-gray-400 line-through' : 'text-gray-900'} line-clamp-3`}>
              {bookmark.message.content}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {formatRelativeTime(bookmark.message.createdAt)}에 작성됨
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {!isDeleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToMessage}
              >
                이동
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              삭제
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
