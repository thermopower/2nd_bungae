/**
 * Webhooks Handler 단위 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  verifyWebhookSecret,
  parseWebhookPayload,
  processWebhookEvent,
  createWebhookResponse,
} from '@/server/handlers/webhooks.handler';
import type { WebhookPayload, MessageRecord } from '@/types/domain/webhook.types';

describe('webhooks.handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, SUPABASE_WEBHOOK_SECRET: 'test-secret-123' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('verifyWebhookSecret', () => {
    it('should return true when secret matches', () => {
      // Arrange
      const secret = 'test-secret-123';

      // Act
      const result = verifyWebhookSecret(secret);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when secret does not match', () => {
      // Arrange
      const secret = 'wrong-secret';

      // Act
      const result = verifyWebhookSecret(secret);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when secret is null', () => {
      // Arrange
      const secret = null;

      // Act
      const result = verifyWebhookSecret(secret);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when secret is undefined', () => {
      // Arrange
      const secret = undefined;

      // Act
      const result = verifyWebhookSecret(secret);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when env variable is not set', () => {
      // Arrange
      delete process.env.SUPABASE_WEBHOOK_SECRET;
      const secret = 'test-secret-123';

      // Act
      const result = verifyWebhookSecret(secret);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('parseWebhookPayload', () => {
    it('should parse valid INSERT payload', () => {
      // Arrange
      const payload: WebhookPayload<MessageRecord> = {
        type: 'INSERT',
        table: 'messages',
        record: {
          id: '123',
          room_id: 'room-1',
          user_id: 'user-1',
          content: 'Hello',
          created_at: '2025-11-17T01:23:45Z',
          deleted_at: null,
        },
        old_record: null,
      };

      // Act
      const result = parseWebhookPayload(payload);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('INSERT');
        expect(result.data.table).toBe('messages');
        expect(result.data.record.id).toBe('123');
      }
    });

    it('should parse valid UPDATE payload', () => {
      // Arrange
      const oldRecord: MessageRecord = {
        id: '123',
        room_id: 'room-1',
        user_id: 'user-1',
        content: 'Old content',
        created_at: '2025-11-17T01:23:45Z',
        deleted_at: null,
      };
      const newRecord: MessageRecord = {
        ...oldRecord,
        content: 'Updated content',
      };
      const payload: WebhookPayload<MessageRecord> = {
        type: 'UPDATE',
        table: 'messages',
        record: newRecord,
        old_record: oldRecord,
      };

      // Act
      const result = parseWebhookPayload(payload);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('UPDATE');
        expect(result.data.old_record).toEqual(oldRecord);
      }
    });

    it('should parse valid DELETE payload', () => {
      // Arrange
      const deletedRecord: MessageRecord = {
        id: '123',
        room_id: 'room-1',
        user_id: 'user-1',
        content: 'Hello',
        created_at: '2025-11-17T01:23:45Z',
        deleted_at: '2025-11-17T02:00:00Z',
      };
      const payload: WebhookPayload<MessageRecord> = {
        type: 'DELETE',
        table: 'messages',
        record: deletedRecord,
        old_record: deletedRecord,
      };

      // Act
      const result = parseWebhookPayload(payload);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('DELETE');
      }
    });

    it('should return error for invalid type', () => {
      // Arrange
      const payload = {
        type: 'INVALID',
        table: 'messages',
        record: {},
        old_record: null,
      };

      // Act
      const result = parseWebhookPayload(payload as unknown as WebhookPayload);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should return error for missing type field', () => {
      // Arrange
      const payload = {
        table: 'messages',
        record: {},
        old_record: null,
      };

      // Act
      const result = parseWebhookPayload(payload as unknown as WebhookPayload);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should return error for missing table field', () => {
      // Arrange
      const payload = {
        type: 'INSERT',
        record: {},
        old_record: null,
      };

      // Act
      const result = parseWebhookPayload(payload as unknown as WebhookPayload);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('processWebhookEvent', () => {
    it('should process INSERT event successfully', () => {
      // Arrange
      const payload: WebhookPayload<MessageRecord> = {
        type: 'INSERT',
        table: 'messages',
        record: {
          id: '123',
          room_id: 'room-1',
          user_id: 'user-1',
          content: 'Hello',
          created_at: '2025-11-17T01:23:45Z',
          deleted_at: null,
        },
        old_record: null,
      };

      // Act
      const result = processWebhookEvent(payload);

      // Assert
      expect(result.success).toBe(true);
      expect(result.processedEvent?.type).toBe('INSERT');
      expect(result.processedEvent?.table).toBe('messages');
      expect(result.processedEvent?.recordId).toBe('123');
    });

    it('should process UPDATE event successfully', () => {
      // Arrange
      const payload: WebhookPayload<MessageRecord> = {
        type: 'UPDATE',
        table: 'messages',
        record: {
          id: '456',
          room_id: 'room-1',
          user_id: 'user-1',
          content: 'Updated',
          created_at: '2025-11-17T01:23:45Z',
          deleted_at: null,
        },
        old_record: null,
      };

      // Act
      const result = processWebhookEvent(payload);

      // Assert
      expect(result.success).toBe(true);
      expect(result.processedEvent?.type).toBe('UPDATE');
      expect(result.processedEvent?.recordId).toBe('456');
    });

    it('should process DELETE event successfully', () => {
      // Arrange
      const payload: WebhookPayload<MessageRecord> = {
        type: 'DELETE',
        table: 'messages',
        record: {
          id: '789',
          room_id: 'room-1',
          user_id: 'user-1',
          content: 'Deleted',
          created_at: '2025-11-17T01:23:45Z',
          deleted_at: '2025-11-17T02:00:00Z',
        },
        old_record: null,
      };

      // Act
      const result = processWebhookEvent(payload);

      // Assert
      expect(result.success).toBe(true);
      expect(result.processedEvent?.type).toBe('DELETE');
      expect(result.processedEvent?.recordId).toBe('789');
    });

    it('should handle record without id field', () => {
      // Arrange
      const payload: WebhookPayload = {
        type: 'INSERT',
        table: 'messages',
        record: { content: 'No ID' },
        old_record: null,
      };

      // Act
      const result = processWebhookEvent(payload);

      // Assert
      expect(result.success).toBe(true);
      expect(result.processedEvent?.recordId).toBe(null);
    });
  });

  describe('createWebhookResponse', () => {
    it('should create success response', () => {
      // Arrange & Act
      const response = createWebhookResponse(true);

      // Assert
      expect(response).toEqual({ ok: true });
    });

    it('should create success response with message', () => {
      // Arrange & Act
      const response = createWebhookResponse(true, 'Event processed');

      // Assert
      expect(response).toEqual({ ok: true, message: 'Event processed' });
    });

    it('should create error response', () => {
      // Arrange & Act
      const response = createWebhookResponse(false, 'Invalid payload');

      // Assert
      expect(response).toEqual({ ok: false, error: 'Invalid payload' });
    });
  });
});
