import { describe, it, expect } from 'vitest';
import {
  POLLING_INTERVAL,
  POLLING_RETRY_DELAY,
  POLLING_MAX_RETRIES,
  MESSAGE_FETCH_LIMIT,
  INITIAL_MESSAGE_LIMIT,
} from '@/constants/polling.constants';

describe('polling.constants', () => {
  describe('POLLING_INTERVAL', () => {
    it('should be 3000ms (3 seconds)', () => {
      expect(POLLING_INTERVAL).toBe(3000);
    });
  });

  describe('POLLING_RETRY_DELAY', () => {
    it('should be 5000ms (5 seconds)', () => {
      expect(POLLING_RETRY_DELAY).toBe(5000);
    });
  });

  describe('POLLING_MAX_RETRIES', () => {
    it('should be 3', () => {
      expect(POLLING_MAX_RETRIES).toBe(3);
    });
  });

  describe('MESSAGE_FETCH_LIMIT', () => {
    it('should be 50', () => {
      expect(MESSAGE_FETCH_LIMIT).toBe(50);
    });
  });

  describe('INITIAL_MESSAGE_LIMIT', () => {
    it('should be 50', () => {
      expect(INITIAL_MESSAGE_LIMIT).toBe(50);
    });
  });
});
