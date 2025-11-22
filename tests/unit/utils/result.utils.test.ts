import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, map, flatMap, unwrapOr } from '@/utils/result.utils';
import type { Result } from '@/types/common/result.types';

describe('result.utils', () => {
  describe('ok', () => {
    it('should create a successful result with data', () => {
      const result = ok('hello');

      expect(result.success).toBe(true);
      expect(result.data).toBe('hello');
    });

    it('should create a successful result with number', () => {
      const result = ok(42);

      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });

    it('should create a successful result with object', () => {
      const data = { id: '1', name: 'test' };
      const result = ok(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should create a successful result with null', () => {
      const result = ok(null);

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });
  });

  describe('err', () => {
    it('should create a failed result with error string', () => {
      const result = err('INVALID');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID');
    });

    it('should create a failed result with error object', () => {
      const error = { code: 'E001', message: 'Error occurred' };
      const result = err(error);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('isOk', () => {
    it('should return true for ok result', () => {
      const result = ok('data');

      expect(isOk(result)).toBe(true);
    });

    it('should return false for err result', () => {
      const result = err('error');

      expect(isOk(result)).toBe(false);
    });

    it('should narrow type correctly', () => {
      const result: Result<string, string> = ok('hello');

      if (isOk(result)) {
        // TypeScript should know result.data exists
        expect(result.data).toBe('hello');
      }
    });
  });

  describe('isErr', () => {
    it('should return true for err result', () => {
      const result = err('error');

      expect(isErr(result)).toBe(true);
    });

    it('should return false for ok result', () => {
      const result = ok('data');

      expect(isErr(result)).toBe(false);
    });

    it('should narrow type correctly', () => {
      const result: Result<string, string> = err('error');

      if (isErr(result)) {
        // TypeScript should know result.error exists
        expect(result.error).toBe('error');
      }
    });
  });

  describe('map', () => {
    it('should transform data when result is ok', () => {
      const result = ok(5);
      const mapped = map(result, (x) => x * 2);

      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(10);
      }
    });

    it('should not transform when result is err', () => {
      const result = err('error');
      const mapped = map(result, (x: number) => x * 2);

      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error).toBe('error');
      }
    });

    it('should support type transformation', () => {
      const result = ok('hello');
      const mapped = map(result, (s) => s.length);

      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(5);
      }
    });
  });

  describe('flatMap', () => {
    it('should chain ok results', () => {
      const result = ok(5);
      const chained = flatMap(result, (x) => ok(x * 2));

      expect(isOk(chained)).toBe(true);
      if (isOk(chained)) {
        expect(chained.data).toBe(10);
      }
    });

    it('should return err from original when original is err', () => {
      const result = err('original error');
      const chained = flatMap(result, (x: number) => ok(x * 2));

      expect(isErr(chained)).toBe(true);
      if (isErr(chained)) {
        expect(chained.error).toBe('original error');
      }
    });

    it('should return err from function when function returns err', () => {
      const result = ok(5);
      const chained = flatMap(result, () => err('function error'));

      expect(isErr(chained)).toBe(true);
      if (isErr(chained)) {
        expect(chained.error).toBe('function error');
      }
    });

    it('should support chaining multiple flatMaps', () => {
      const result = ok(5);
      const chained = flatMap(
        flatMap(result, (x) => ok(x * 2)),
        (x) => ok(x + 1)
      );

      expect(isOk(chained)).toBe(true);
      if (isOk(chained)) {
        expect(chained.data).toBe(11);
      }
    });
  });

  describe('unwrapOr', () => {
    it('should return data when result is ok', () => {
      const result = ok(5);
      const value = unwrapOr(result, 0);

      expect(value).toBe(5);
    });

    it('should return default value when result is err', () => {
      const result = err('error');
      const value = unwrapOr(result, 0);

      expect(value).toBe(0);
    });

    it('should work with string type', () => {
      const result = ok('hello');
      const value = unwrapOr(result, 'default');

      expect(value).toBe('hello');
    });

    it('should return default string when result is err', () => {
      const result = err('error');
      const value = unwrapOr(result, 'default');

      expect(value).toBe('default');
    });

    it('should work with complex types', () => {
      type User = { id: string; name: string };
      const defaultUser: User = { id: '0', name: 'Guest' };
      const result = err('not found');
      const value = unwrapOr(result, defaultUser);

      expect(value).toEqual(defaultUser);
    });
  });
});
