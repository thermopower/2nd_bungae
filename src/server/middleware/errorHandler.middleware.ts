/**
 * Error Handler Middleware - 에러 핸들러 미들웨어
 *
 * Hono 앱에서 발생하는 에러를 일관되게 처리합니다.
 */

import type { Context, Next } from 'hono';
import { ERROR_CODES, ERROR_MESSAGES } from '@/constants/error.constants';
import type { ErrorCode } from '@/constants/error.constants';

/** API 에러 응답 형식 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

/** HTTP 상태 코드 타입 */
type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 409 | 429 | 500;

/**
 * 에러 코드에 해당하는 HTTP 상태 코드를 반환합니다.
 */
const getHttpStatus = (code: string): HttpStatusCode => {
  const statusMap: Record<string, HttpStatusCode> = {
    [ERROR_CODES.UNAUTHORIZED]: 401,
    [ERROR_CODES.INVALID_CREDENTIALS]: 401,
    [ERROR_CODES.SESSION_EXPIRED]: 401,
    [ERROR_CODES.ROOM_ACCESS_DENIED]: 403,
    [ERROR_CODES.NOT_MESSAGE_OWNER]: 403,
    [ERROR_CODES.ROOM_NOT_FOUND]: 404,
    [ERROR_CODES.MESSAGE_NOT_FOUND]: 404,
    [ERROR_CODES.INVALID_INPUT]: 400,
    [ERROR_CODES.INVALID_EMAIL_FORMAT]: 400,
    [ERROR_CODES.PASSWORD_TOO_SHORT]: 400,
    [ERROR_CODES.PASSWORD_MISMATCH]: 400,
    [ERROR_CODES.MESSAGE_TOO_LONG]: 400,
    [ERROR_CODES.EMPTY_MESSAGE]: 400,
    [ERROR_CODES.ALREADY_MEMBER]: 409,
    [ERROR_CODES.EMAIL_ALREADY_EXISTS]: 409,
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
    [ERROR_CODES.NOT_A_MEMBER]: 403,
  };

  return statusMap[code] ?? 500;
};

/**
 * 에러 코드에 해당하는 메시지를 반환합니다.
 */
const getErrorMessage = (code: string): string => {
  return ERROR_MESSAGES[code as ErrorCode] ?? '오류가 발생했습니다.';
};

/**
 * API 에러 응답을 생성합니다.
 */
export const createErrorResponse = (
  code: string,
  message?: string
): ApiErrorResponse => ({
  success: false,
  error: {
    code,
    message: message ?? getErrorMessage(code),
  },
});

/**
 * 에러 핸들러 미들웨어
 * 모든 에러를 캐치하여 일관된 형식으로 응답합니다.
 */
export const errorHandler = async (c: Context, next: Next): Promise<Response | void> => {
  try {
    await next();
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error) {
      // 커스텀 에러 처리
      const code = (error as { code?: string }).code ?? ERROR_CODES.INTERNAL_ERROR;
      const status = getHttpStatus(code);

      return c.json(createErrorResponse(code, error.message), status);
    }

    // 알 수 없는 에러
    return c.json(
      createErrorResponse(ERROR_CODES.INTERNAL_ERROR),
      500 as const
    );
  }
};

/**
 * API 에러를 발생시킵니다.
 */
export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? getErrorMessage(code));
    this.code = code;
    this.name = 'ApiError';
  }
}

/**
 * 에러 응답을 반환합니다. (throw 없이)
 */
export const respondWithError = (
  c: Context,
  code: string,
  message?: string
): Response => {
  const status = getHttpStatus(code);
  return c.json(createErrorResponse(code, message), status);
};
