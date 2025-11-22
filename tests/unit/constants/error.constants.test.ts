import { describe, it, expect } from 'vitest';
import { ERROR_CODES, ERROR_MESSAGES, type ErrorCode } from '@/constants/error.constants';

describe('error.constants', () => {
  describe('ERROR_CODES', () => {
    it('should have UNAUTHORIZED code', () => {
      expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED');
    });

    it('should have INVALID_CREDENTIALS code', () => {
      expect(ERROR_CODES.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
    });

    it('should have EMAIL_ALREADY_EXISTS code', () => {
      expect(ERROR_CODES.EMAIL_ALREADY_EXISTS).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should have SESSION_EXPIRED code', () => {
      expect(ERROR_CODES.SESSION_EXPIRED).toBe('SESSION_EXPIRED');
    });

    it('should have INVALID_EMAIL_FORMAT code', () => {
      expect(ERROR_CODES.INVALID_EMAIL_FORMAT).toBe('INVALID_EMAIL_FORMAT');
    });

    it('should have PASSWORD_TOO_SHORT code', () => {
      expect(ERROR_CODES.PASSWORD_TOO_SHORT).toBe('PASSWORD_TOO_SHORT');
    });

    it('should have PASSWORD_MISMATCH code', () => {
      expect(ERROR_CODES.PASSWORD_MISMATCH).toBe('PASSWORD_MISMATCH');
    });

    it('should have ROOM_NOT_FOUND code', () => {
      expect(ERROR_CODES.ROOM_NOT_FOUND).toBe('ROOM_NOT_FOUND');
    });

    it('should have MESSAGE_NOT_FOUND code', () => {
      expect(ERROR_CODES.MESSAGE_NOT_FOUND).toBe('MESSAGE_NOT_FOUND');
    });

    it('should have MESSAGE_TOO_LONG code', () => {
      expect(ERROR_CODES.MESSAGE_TOO_LONG).toBe('MESSAGE_TOO_LONG');
    });

    it('should have RATE_LIMIT_EXCEEDED code', () => {
      expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have message for UNAUTHORIZED', () => {
      expect(ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED]).toBeDefined();
      expect(typeof ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED]).toBe('string');
    });

    it('should have message for all error codes', () => {
      const allCodes = Object.values(ERROR_CODES) as ErrorCode[];

      allCodes.forEach((code) => {
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(typeof ERROR_MESSAGES[code]).toBe('string');
        expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0);
      });
    });

    it('should have Korean messages', () => {
      expect(ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED]).toContain('인증');
    });
  });
});
