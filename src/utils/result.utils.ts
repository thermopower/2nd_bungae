/**
 * Result 유틸리티 함수
 *
 * Result<T, E> 타입을 생성하고 조작하는 순수 함수들입니다.
 * 함수형 프로그래밍 패턴을 따릅니다.
 */

import type { Result, Ok, Err } from '@/types/common/result.types';

/**
 * 성공 결과를 생성합니다.
 * @param data - 성공 시 반환할 데이터
 * @returns Ok<T> 타입의 결과
 * @example
 * const result = ok('hello'); // { success: true, data: 'hello' }
 */
export const ok = <T>(data: T): Ok<T> => ({
  success: true,
  data,
});

/**
 * 실패 결과를 생성합니다.
 * @param error - 에러 정보
 * @returns Err<E> 타입의 결과
 * @example
 * const result = err('INVALID'); // { success: false, error: 'INVALID' }
 */
export const err = <E>(error: E): Err<E> => ({
  success: false,
  error,
});

/**
 * 결과가 성공인지 확인하는 타입 가드
 * @param result - 검사할 Result
 * @returns 성공이면 true, 실패면 false
 * @example
 * if (isOk(result)) {
 *   console.log(result.data); // TypeScript가 data 접근을 허용
 * }
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> =>
  result.success;

/**
 * 결과가 실패인지 확인하는 타입 가드
 * @param result - 검사할 Result
 * @returns 실패면 true, 성공이면 false
 * @example
 * if (isErr(result)) {
 *   console.log(result.error); // TypeScript가 error 접근을 허용
 * }
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  !result.success;

/**
 * 성공 결과의 데이터를 변환합니다.
 * 실패 결과는 그대로 반환합니다.
 * @param result - 변환할 Result
 * @param fn - 데이터 변환 함수
 * @returns 변환된 Result
 * @example
 * const result = ok(5);
 * const doubled = map(result, x => x * 2); // ok(10)
 */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> =>
  isOk(result) ? ok(fn(result.data)) : result;

/**
 * 성공 결과에 대해 Result를 반환하는 함수를 적용합니다.
 * 실패 결과는 그대로 반환합니다.
 * @param result - 변환할 Result
 * @param fn - Result를 반환하는 변환 함수
 * @returns 변환된 Result
 * @example
 * const result = ok(5);
 * const chained = flatMap(result, x => ok(x * 2)); // ok(10)
 * const failed = flatMap(result, () => err('ERROR')); // err('ERROR')
 */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> =>
  isOk(result) ? fn(result.data) : result;

/**
 * 성공 시 데이터를, 실패 시 기본값을 반환합니다.
 * @param result - 언래핑할 Result
 * @param defaultValue - 실패 시 반환할 기본값
 * @returns 데이터 또는 기본값
 * @example
 * unwrapOr(ok(5), 0) // 5
 * unwrapOr(err('ERROR'), 0) // 0
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T =>
  isOk(result) ? result.data : defaultValue;
