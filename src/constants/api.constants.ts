/**
 * API 관련 상수 정의
 */

/** API 기본 경로 */
export const API_BASE_URL = '/api' as const;

/** API 엔드포인트 정의 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  ROOMS: {
    LIST: `${API_BASE_URL}/rooms`,
    DETAIL: (roomId: string) => `${API_BASE_URL}/rooms/${roomId}`,
    MESSAGES: (roomId: string) => `${API_BASE_URL}/rooms/${roomId}/messages`,
    JOIN: (roomId: string) => `${API_BASE_URL}/rooms/${roomId}/join`,
    LEAVE: (roomId: string) => `${API_BASE_URL}/rooms/${roomId}/leave`,
  },
  MESSAGES: {
    DELETE: (messageId: string) => `${API_BASE_URL}/messages/${messageId}`,
    REACTIONS: (messageId: string) => `${API_BASE_URL}/messages/${messageId}/reactions`,
    BOOKMARKS: (messageId: string) => `${API_BASE_URL}/messages/${messageId}/bookmarks`,
  },
  BOOKMARKS: {
    LIST: `${API_BASE_URL}/bookmarks`,
    DELETE: (bookmarkId: string) => `${API_BASE_URL}/bookmarks/${bookmarkId}`,
  },
} as const;

/** HTTP 상태 코드 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
