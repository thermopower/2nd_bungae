/**
 * User Repository - 사용자 데이터 접근
 *
 * profiles 테이블과 관련된 데이터 접근을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { User } from '@/types/domain/user.types';
import type { ApiError, DbProfile } from './base.repository';
import { toApiError } from './base.repository';

/**
 * DB Row를 User 도메인 타입으로 변환합니다.
 * @param row - DB Row
 * @returns User 도메인 객체
 */
const toUser = (row: DbProfile): User => ({
  id: row.id,
  email: row.email,
  nickname: row.nickname,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * ID로 사용자를 조회합니다.
 * @param client - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @returns Result<User, ApiError>
 */
export const findById = async (
  client: ServerClient,
  userId: string
): Promise<Result<User, ApiError>> => {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  if (!data) {
    return err({ code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' });
  }

  return ok(toUser(data));
};

/**
 * 이메일로 사용자를 조회합니다.
 * @param client - Supabase 클라이언트
 * @param email - 이메일
 * @returns Result<User | null, ApiError>
 */
export const findByEmail = async (
  client: ServerClient,
  email: string
): Promise<Result<User | null, ApiError>> => {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(data ? toUser(data) : null);
};

/**
 * 새 사용자 프로필을 생성합니다.
 * @param client - Supabase 클라이언트
 * @param params - 사용자 생성 파라미터
 * @returns Result<User, ApiError>
 */
export const create = async (
  client: ServerClient,
  params: { id: string; email: string; nickname?: string }
): Promise<Result<User, ApiError>> => {
  const { data, error } = await client
    .from('profiles')
    .insert({
      id: params.id,
      email: params.email,
      nickname: params.nickname ?? null,
    })
    .select()
    .single();

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  if (!data) {
    return err({ code: 'INTERNAL_ERROR', message: '사용자 생성에 실패했습니다.' });
  }

  return ok(toUser(data));
};

/**
 * 사용자 프로필을 업데이트합니다.
 * @param client - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @param params - 업데이트 파라미터
 * @returns Result<User, ApiError>
 */
export const update = async (
  client: ServerClient,
  userId: string,
  params: { nickname?: string }
): Promise<Result<User, ApiError>> => {
  const { data, error } = await client
    .from('profiles')
    .update({
      nickname: params.nickname,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  if (!data) {
    return err({ code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.' });
  }

  return ok(toUser(data));
};
