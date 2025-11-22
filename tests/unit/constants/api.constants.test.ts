import { describe, it, expect } from 'vitest';
import { API_BASE_URL, API_ENDPOINTS, HTTP_STATUS } from '@/constants/api.constants';

describe('api.constants', () => {
  describe('API_BASE_URL', () => {
    it('should be /api', () => {
      expect(API_BASE_URL).toBe('/api');
    });
  });

  describe('API_ENDPOINTS', () => {
    describe('AUTH', () => {
      it('should have LOGIN endpoint', () => {
        expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/api/auth/login');
      });

      it('should have SIGNUP endpoint', () => {
        expect(API_ENDPOINTS.AUTH.SIGNUP).toBe('/api/auth/signup');
      });

      it('should have LOGOUT endpoint', () => {
        expect(API_ENDPOINTS.AUTH.LOGOUT).toBe('/api/auth/logout');
      });
    });

    describe('ROOMS', () => {
      it('should have LIST endpoint', () => {
        expect(API_ENDPOINTS.ROOMS.LIST).toBe('/api/rooms');
      });

      it('should have DETAIL function', () => {
        expect(API_ENDPOINTS.ROOMS.DETAIL('123')).toBe('/api/rooms/123');
      });

      it('should have MESSAGES function', () => {
        expect(API_ENDPOINTS.ROOMS.MESSAGES('123')).toBe('/api/rooms/123/messages');
      });

      it('should have JOIN function', () => {
        expect(API_ENDPOINTS.ROOMS.JOIN('123')).toBe('/api/rooms/123/join');
      });

      it('should have LEAVE function', () => {
        expect(API_ENDPOINTS.ROOMS.LEAVE('123')).toBe('/api/rooms/123/leave');
      });
    });

    describe('MESSAGES', () => {
      it('should have DELETE function', () => {
        expect(API_ENDPOINTS.MESSAGES.DELETE('msg-1')).toBe('/api/messages/msg-1');
      });

      it('should have REACTIONS function', () => {
        expect(API_ENDPOINTS.MESSAGES.REACTIONS('msg-1')).toBe('/api/messages/msg-1/reactions');
      });
    });

    describe('BOOKMARKS', () => {
      it('should have LIST endpoint', () => {
        expect(API_ENDPOINTS.BOOKMARKS.LIST).toBe('/api/bookmarks');
      });

      it('should have DELETE function', () => {
        expect(API_ENDPOINTS.BOOKMARKS.DELETE('bm-1')).toBe('/api/bookmarks/bm-1');
      });
    });
  });

  describe('HTTP_STATUS', () => {
    it('should have OK status', () => {
      expect(HTTP_STATUS.OK).toBe(200);
    });

    it('should have CREATED status', () => {
      expect(HTTP_STATUS.CREATED).toBe(201);
    });

    it('should have BAD_REQUEST status', () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    });

    it('should have UNAUTHORIZED status', () => {
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    });

    it('should have FORBIDDEN status', () => {
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    });

    it('should have NOT_FOUND status', () => {
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    });

    it('should have TOO_MANY_REQUESTS status', () => {
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
    });

    it('should have INTERNAL_SERVER_ERROR status', () => {
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });
});
