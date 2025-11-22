/**
 * Webhooks Routes 단위 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { webhooksRoutes } from '@/server/routes/webhooks.routes';

describe('webhooksRoutes', () => {
  const originalEnv = process.env;
  let app: Hono;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, SUPABASE_WEBHOOK_SECRET: 'test-secret-123' };
    app = new Hono();
    app.route('/webhooks', webhooksRoutes);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /webhooks/supabase', () => {
    it('should return 401 when webhook secret is missing', async () => {
      // Arrange
      const payload = {
        type: 'INSERT',
        table: 'messages',
        record: { id: '123', content: 'Hello' },
        old_record: null,
      };

      // Act
      const res = await app.request('/webhooks/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Assert
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.ok).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when webhook secret is invalid', async () => {
      // Arrange
      const payload = {
        type: 'INSERT',
        table: 'messages',
        record: { id: '123', content: 'Hello' },
        old_record: null,
      };

      // Act
      const res = await app.request('/webhooks/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'wrong-secret',
        },
        body: JSON.stringify(payload),
      });

      // Assert
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.ok).toBe(false);
    });

    it('should return 400 when payload is invalid JSON', async () => {
      // Act
      const res = await app.request('/webhooks/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'test-secret-123',
        },
        body: 'invalid json',
      });

      // Assert
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.ok).toBe(false);
    });

    it('should return 400 when payload is missing required fields', async () => {
      // Arrange
      const payload = {
        table: 'messages',
        record: { id: '123' },
      };

      // Act
      const res = await app.request('/webhooks/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'test-secret-123',
        },
        body: JSON.stringify(payload),
      });

      // Assert
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.ok).toBe(false);
    });

    it('should return 200 for valid INSERT event', async () => {
      // Arrange
      const payload = {
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
      const res = await app.request('/webhooks/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'test-secret-123',
        },
        body: JSON.stringify(payload),
      });

      // Assert
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });

    it('should return 200 for valid UPDATE event', async () => {
      // Arrange
      const payload = {
        type: 'UPDATE',
        table: 'messages',
        record: {
          id: '123',
          room_id: 'room-1',
          user_id: 'user-1',
          content: 'Updated content',
          created_at: '2025-11-17T01:23:45Z',
          deleted_at: null,
        },
        old_record: {
          id: '123',
          room_id: 'room-1',
          user_id: 'user-1',
          content: 'Original content',
          created_at: '2025-11-17T01:23:45Z',
          deleted_at: null,
        },
      };

      // Act
      const res = await app.request('/webhooks/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'test-secret-123',
        },
        body: JSON.stringify(payload),
      });

      // Assert
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });

    it('should return 200 for valid DELETE event', async () => {
      // Arrange
      const payload = {
        type: 'DELETE',
        table: 'messages',
        record: {
          id: '123',
          room_id: 'room-1',
          user_id: 'user-1',
          content: 'Deleted message',
          created_at: '2025-11-17T01:23:45Z',
          deleted_at: '2025-11-17T02:00:00Z',
        },
        old_record: null,
      };

      // Act
      const res = await app.request('/webhooks/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': 'test-secret-123',
        },
        body: JSON.stringify(payload),
      });

      // Assert
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });

    it('should handle case-insensitive header name', async () => {
      // Arrange
      const payload = {
        type: 'INSERT',
        table: 'messages',
        record: { id: '123' },
        old_record: null,
      };

      // Act
      const res = await app.request('/webhooks/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': 'test-secret-123', // lowercase
        },
        body: JSON.stringify(payload),
      });

      // Assert
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
    });
  });
});
