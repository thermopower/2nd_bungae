import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatRelativeTime,
  formatDateTime,
  isValidISOString,
  toISOString,
} from '@/utils/date.utils';

describe('date.utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-23T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatRelativeTime', () => {
    it('should return "방금 전" for time less than 1 minute ago', () => {
      const thirtySecondsAgo = new Date('2025-11-23T11:59:30.000Z').toISOString();
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('방금 전');
    });

    it('should return "N분 전" for time less than 1 hour ago', () => {
      const fiveMinutesAgo = new Date('2025-11-23T11:55:00.000Z').toISOString();
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5분 전');
    });

    it('should return "N시간 전" for time less than 1 day ago', () => {
      const twoHoursAgo = new Date('2025-11-23T10:00:00.000Z').toISOString();
      expect(formatRelativeTime(twoHoursAgo)).toBe('2시간 전');
    });

    it('should return "N일 전" for time less than 1 week ago', () => {
      const oneDayAgo = new Date('2025-11-22T12:00:00.000Z').toISOString();
      expect(formatRelativeTime(oneDayAgo)).toBe('1일 전');
    });

    it('should return formatted date for time more than 1 week ago', () => {
      const tenDaysAgo = new Date('2025-11-13T12:00:00.000Z').toISOString();
      const result = formatRelativeTime(tenDaysAgo);
      expect(result).toContain('2025');
    });
  });

  describe('formatDateTime', () => {
    it('should format date as YYYY.MM.DD HH:mm', () => {
      const date = '2025-11-23T14:30:00.000Z';
      const result = formatDateTime(date);
      // UTC 시간이므로 로컬 시간대에 따라 다를 수 있음
      expect(result).toMatch(/\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}/);
    });

    it('should pad single digit months and days', () => {
      const date = '2025-01-05T08:05:00.000Z';
      const result = formatDateTime(date);
      expect(result).toMatch(/\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}/);
    });
  });

  describe('isValidISOString', () => {
    it('should return true for valid ISO string', () => {
      expect(isValidISOString('2025-11-23T12:00:00.000Z')).toBe(true);
    });

    it('should return true for valid ISO string without milliseconds', () => {
      expect(isValidISOString('2025-11-23T12:00:00Z')).toBe(true);
    });

    it('should return false for invalid string', () => {
      expect(isValidISOString('invalid')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidISOString('')).toBe(false);
    });

    it('should return false for random text', () => {
      expect(isValidISOString('not a date')).toBe(false);
    });
  });

  describe('toISOString', () => {
    it('should convert Date to ISO string', () => {
      const date = new Date('2025-11-23T12:00:00.000Z');
      expect(toISOString(date)).toBe('2025-11-23T12:00:00.000Z');
    });
  });
});
