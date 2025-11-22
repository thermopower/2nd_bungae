/**
 * User 도메인 타입 정의
 */

/** 사용자 정보 */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly nickname: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** 사용자 프로필 (간략 정보) */
export type UserProfile = Pick<User, 'id' | 'nickname'>;
