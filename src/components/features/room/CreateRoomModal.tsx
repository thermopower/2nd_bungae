'use client';

import { useState, FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface CreateRoomModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (name: string, description?: string, isPublic?: boolean) => Promise<void>;
  readonly isLoading?: boolean;
  readonly error?: string | null;
}

export const CreateRoomModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error,
}: CreateRoomModalProps): JSX.Element => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [nameError, setNameError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('채팅방 이름을 입력해주세요');
      return;
    }

    if (name.length > 50) {
      setNameError('채팅방 이름은 50자 이내로 입력해주세요');
      return;
    }

    setNameError('');
    await onSubmit(name.trim(), description.trim() || undefined, isPublic);
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setIsPublic(true);
    setNameError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 채팅방 만들기" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <ErrorMessage message={error} />
        )}

        <Input
          label="채팅방 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          placeholder="채팅방 이름을 입력하세요"
          maxLength={50}
          required
        />

        <TextArea
          label="설명 (선택)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="채팅방에 대한 설명을 입력하세요"
          rows={3}
          maxLength={200}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            공개 채팅방
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
            취소
          </Button>
          <Button type="submit" isLoading={isLoading} fullWidth>
            만들기
          </Button>
        </div>
      </form>
    </Modal>
  );
};
