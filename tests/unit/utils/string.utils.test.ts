import { describe, it, expect } from 'vitest';
import { truncate, sanitize, generateId, capitalize } from '@/utils/string.utils';

describe('string.utils', () => {
  describe('truncate', () => {
    it('should truncate string longer than maxLength', () => {
      expect(truncate('hello world', 5)).toBe('hello...');
    });

    it('should not truncate string shorter than maxLength', () => {
      expect(truncate('hi', 5)).toBe('hi');
    });

    it('should not truncate string equal to maxLength', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(truncate('', 5)).toBe('');
    });

    it('should handle maxLength of 0', () => {
      expect(truncate('hello', 0)).toBe('...');
    });
  });

  describe('sanitize', () => {
    it('should escape < character', () => {
      expect(sanitize('<div>')).toBe('&lt;div&gt;');
    });

    it('should escape > character', () => {
      expect(sanitize('a > b')).toBe('a &gt; b');
    });

    it('should escape " character', () => {
      expect(sanitize('say "hello"')).toBe('say &quot;hello&quot;');
    });

    it("should escape ' character", () => {
      expect(sanitize("it's")).toBe('it&#x27;s');
    });

    it('should escape script tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitize(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should handle string with no special characters', () => {
      expect(sanitize('hello world')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(sanitize('')).toBe('');
    });
  });

  describe('generateId', () => {
    it('should return a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('should return non-empty string', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should keep rest of string unchanged', () => {
      expect(capitalize('hELLO')).toBe('HELLO');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
  });
});
