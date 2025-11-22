/**
 * Base Repository - 공통 Repository 유틸리티
 *
 * Repository 레이어에서 공통으로 사용되는 타입과 유틸리티 함수를 정의합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import type { TableRow } from '@/external/supabase/types';

/** API 에러 타입 */
export interface ApiError {
  readonly code: string;
  readonly message: string;
}

/** 페이지네이션 파라미터 */
export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
}

/** 페이지네이션 결과 */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly hasMore: boolean;
  readonly total?: number;
}

/**
 * Supabase 에러를 ApiError로 변환합니다.
 * @param error - Supabase 에러 객체
 * @param defaultCode - 기본 에러 코드
 * @returns ApiError
 */
export const toApiError = (
  error: { code?: string; message?: string } | null,
  defaultCode = 'INTERNAL_ERROR'
): ApiError => ({
  code: error?.code ?? defaultCode,
  message: error?.message ?? '오류가 발생했습니다.',
});

/**
 * DB 조회 결과를 Result 타입으로 변환합니다.
 * @param data - 조회된 데이터
 * @param error - Supabase 에러
 * @param notFoundCode - 데이터가 없을 때 에러 코드
 * @returns Result<T, ApiError>
 */
export const toResult = <T>(
  data: T | null,
  error: { code?: string; message?: string } | null,
  notFoundCode?: string
): Result<T, ApiError> => {
  if (error) {
    return err(toApiError(error));
  }
  if (data === null && notFoundCode) {
    return err({ code: notFoundCode, message: '데이터를 찾을 수 없습니다.' });
  }
  return ok(data as T);
};

/**
 * DB 리스트 조회 결과를 Result 타입으로 변환합니다.
 * @param data - 조회된 데이터 배열
 * @param error - Supabase 에러
 * @returns Result<T[], ApiError>
 */
export const toListResult = <T>(
  data: T[] | null,
  error: { code?: string; message?: string } | null
): Result<readonly T[], ApiError> => {
  if (error) {
    return err(toApiError(error));
  }
  return ok(data ?? []);
};

/**
 * 페이지네이션 offset을 계산합니다.
 * @param params - 페이지네이션 파라미터
 * @returns offset 값
 */
export const calculateOffset = (params: PaginationParams): number =>
  (params.page - 1) * params.limit;

/**
 * hasMore 여부를 판단합니다.
 * @param fetchedCount - 조회된 데이터 수
 * @param limit - 요청한 limit
 * @returns hasMore 여부
 */
export const hasMoreItems = (fetchedCount: number, limit: number): boolean =>
  fetchedCount === limit;

/** profiles 테이블 Row 타입 */
export type DbProfile = TableRow<'profiles'>;

/** rooms 테이블 Row 타입 */
export type DbRoom = TableRow<'rooms'>;

/** room_members 테이블 Row 타입 */
export type DbRoomMember = TableRow<'room_members'>;

/** messages 테이블 Row 타입 */
export type DbMessage = TableRow<'messages'>;

/** reactions 테이블 Row 타입 */
export type DbReaction = TableRow<'reactions'>;

/** bookmarks 테이블 Row 타입 */
export type DbBookmark = TableRow<'bookmarks'>;
