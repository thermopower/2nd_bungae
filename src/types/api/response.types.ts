/**
 * API 응답 타입 정의
 */

/** 기본 API 응답 */
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
  };
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasMore: boolean;
}

/** 폴링 응답 */
export interface PollingResponse<T> {
  readonly items: readonly T[];
  readonly lastId: string | null;
  readonly hasMore: boolean;
}
