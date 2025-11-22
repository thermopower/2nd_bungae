import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isNotEmpty,
  isWithinLength,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateMessageContent,
  validateRoomName,
} from '@/utils/validation.utils';
import { isOk, isErr } from '@/utils/result.utils';

describe('validation.utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should return true for email with subdomain', () => {
      expect(isValidEmail('test@mail.example.com')).toBe(true);
    });

    it('should return false for invalid email without @', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should return false for email without domain', () => {
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should return false for email without username', () => {
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });

    it('should return false for email with spaces', () => {
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for password with 8 or more characters', () => {
      expect(isValidPassword('12345678')).toBe(true);
    });

    it('should return true for password with exactly 8 characters', () => {
      expect(isValidPassword('abcdefgh')).toBe(true);
    });

    it('should return false for password with 7 characters', () => {
      expect(isValidPassword('1234567')).toBe(false);
    });

    it('should return false for empty password', () => {
      expect(isValidPassword('')).toBe(false);
    });

    it('should return true for long password', () => {
      expect(isValidPassword('a'.repeat(100))).toBe(true);
    });
  });

  describe('isNotEmpty', () => {
    it('should return true for non-empty string', () => {
      expect(isNotEmpty('hello')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isNotEmpty('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(isNotEmpty('   ')).toBe(false);
    });

    it('should return false for tab and newline only', () => {
      expect(isNotEmpty('\t\n')).toBe(false);
    });

    it('should return true for string with leading/trailing spaces', () => {
      expect(isNotEmpty('  hello  ')).toBe(true);
    });
  });

  describe('isWithinLength', () => {
    it('should return true when string is shorter than max', () => {
      expect(isWithinLength('hello', 10)).toBe(true);
    });

    it('should return true when string equals max length', () => {
      expect(isWithinLength('hello', 5)).toBe(true);
    });

    it('should return false when string exceeds max length', () => {
      expect(isWithinLength('hello world', 5)).toBe(false);
    });

    it('should return true for empty string', () => {
      expect(isWithinLength('', 5)).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('should return Ok for valid email', () => {
      const result = validateEmail('test@example.com');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should return Err for invalid email', () => {
      const result = validateEmail('invalid-email');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe('INVALID_EMAIL_FORMAT');
      }
    });
  });

  describe('validatePassword', () => {
    it('should return Ok for valid password', () => {
      const result = validatePassword('12345678');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('12345678');
      }
    });

    it('should return Err for short password', () => {
      const result = validatePassword('1234');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe('PASSWORD_TOO_SHORT');
      }
    });
  });

  describe('validatePasswordMatch', () => {
    it('should return Ok when passwords match', () => {
      const result = validatePasswordMatch('password123', 'password123');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('password123');
      }
    });

    it('should return Err when passwords do not match', () => {
      const result = validatePasswordMatch('password123', 'different');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe('PASSWORD_MISMATCH');
      }
    });
  });

  describe('validateMessageContent', () => {
    it('should return Ok for valid message', () => {
      const result = validateMessageContent('Hello, world!');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('Hello, world!');
      }
    });

    it('should trim whitespace from valid message', () => {
      const result = validateMessageContent('  Hello  ');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('Hello');
      }
    });

    it('should return Err for empty message', () => {
      const result = validateMessageContent('');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe('EMPTY_MESSAGE');
      }
    });

    it('should return Err for whitespace-only message', () => {
      const result = validateMessageContent('   ');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe('EMPTY_MESSAGE');
      }
    });

    it('should return Err for message exceeding 2000 characters', () => {
      const longMessage = 'a'.repeat(2001);
      const result = validateMessageContent(longMessage);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe('MESSAGE_TOO_LONG');
      }
    });

    it('should return Ok for message with exactly 2000 characters', () => {
      const maxMessage = 'a'.repeat(2000);
      const result = validateMessageContent(maxMessage);
      expect(isOk(result)).toBe(true);
    });
  });

  describe('validateRoomName', () => {
    it('should return Ok for valid room name', () => {
      const result = validateRoomName('My Chat Room');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('My Chat Room');
      }
    });

    it('should trim whitespace from valid room name', () => {
      const result = validateRoomName('  Room Name  ');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('Room Name');
      }
    });

    it('should return Err for empty room name', () => {
      const result = validateRoomName('');
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe('INVALID_INPUT');
      }
    });

    it('should return Err for room name exceeding 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = validateRoomName(longName);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe('INVALID_INPUT');
      }
    });

    it('should return Ok for room name with exactly 50 characters', () => {
      const maxName = 'a'.repeat(50);
      const result = validateRoomName(maxName);
      expect(isOk(result)).toBe(true);
    });
  });
});
