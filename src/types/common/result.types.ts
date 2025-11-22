/**
 * Result 타입 - 함수형 에러 처리 패턴
 *
 * 성공(Ok)과 실패(Err)를 명시적으로 표현하여
 * 예외 기반 에러 처리를 대체합니다.
 */

/**
 * 성공 결과를 나타내는 타입
 * @template T - 성공 시 반환되는 데이터 타입
 */
export type Ok<T> = {
  readonly success: true;
  readonly data: T;
};

/**
 * 실패 결과를 나타내는 타입
 * @template E - 에러 타입 (기본값: string)
 */
export type Err<E> = {
  readonly success: false;
  readonly error: E;
};

/**
 * Result 타입 - 성공 또는 실패를 표현
 * @template T - 성공 시 데이터 타입
 * @template E - 에러 타입 (기본값: string)
 */
export type Result<T, E = string> = Ok<T> | Err<E>;
