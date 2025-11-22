/**
 * Webhooks Handler - Supabase 웹훅 핸들러
 *
 * Supabase Database Webhook 이벤트를 처리합니다.
 */

import type { Context } from 'hono';
import { ok, err } from '@/utils/result.utils';
import type { Result } from '@/types/common/result.types';
import type {
  WebhookPayload,
  WebhookEventType,
  WebhookHandlerResult,
  WebhookRecord,
} from '@/types/domain/webhook.types';

/** 유효한 이벤트 타입 목록 */
const VALID_EVENT_TYPES: readonly WebhookEventType[] = ['INSERT', 'UPDATE', 'DELETE'];

/** 웹훅 응답 타입 */
interface WebhookResponse {
  readonly ok: boolean;
  readonly message?: string;
  readonly error?: string;
}

/**
 * 웹훅 시크릿 검증
 * Shared Secret 방식으로 인증합니다.
 *
 * @param secret - 요청 헤더의 X-Webhook-Secret 값
 * @returns 시크릿이 유효하면 true, 그렇지 않으면 false
 */
export const verifyWebhookSecret = (secret: string | null | undefined): boolean => {
  const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!expectedSecret || !secret) {
    return false;
  }

  return secret === expectedSecret;
};

/**
 * 웹훅 페이로드 파싱 및 검증
 *
 * @param payload - 웹훅 요청 바디
 * @returns 검증된 페이로드 또는 에러
 */
export const parseWebhookPayload = <T extends WebhookRecord = WebhookRecord>(
  payload: unknown
): Result<WebhookPayload<T>, { code: string; message: string }> => {
  if (!payload || typeof payload !== 'object') {
    return err({ code: 'INVALID_PAYLOAD', message: '페이로드가 유효하지 않습니다.' });
  }

  const data = payload as Record<string, unknown>;

  // type 필드 검증
  if (!('type' in data) || typeof data.type !== 'string') {
    return err({ code: 'MISSING_TYPE', message: 'type 필드가 누락되었습니다.' });
  }

  if (!VALID_EVENT_TYPES.includes(data.type as WebhookEventType)) {
    return err({ code: 'INVALID_TYPE', message: `유효하지 않은 이벤트 타입입니다: ${data.type}` });
  }

  // table 필드 검증
  if (!('table' in data) || typeof data.table !== 'string') {
    return err({ code: 'MISSING_TABLE', message: 'table 필드가 누락되었습니다.' });
  }

  // record 필드 검증
  if (!('record' in data)) {
    return err({ code: 'MISSING_RECORD', message: 'record 필드가 누락되었습니다.' });
  }

  return ok(payload as WebhookPayload<T>);
};

/**
 * 웹훅 이벤트 처리
 *
 * @param payload - 검증된 웹훅 페이로드
 * @returns 처리 결과
 */
export const processWebhookEvent = <T extends WebhookRecord = WebhookRecord>(
  payload: WebhookPayload<T>
): WebhookHandlerResult => {
  const { type, table, record } = payload;

  // 레코드 ID 추출 (id 필드가 있는 경우)
  const recordId =
    record && typeof record === 'object' && 'id' in record
      ? String((record as { id: unknown }).id)
      : null;

  // 이벤트 타입별 처리 (확장 가능)
  // TODO: 필요시 알림 발송, 외부 API 호출, 로그 적재 등 추가 처리
  switch (type) {
    case 'INSERT':
      // 새 레코드 삽입 처리
      break;
    case 'UPDATE':
      // 레코드 업데이트 처리
      break;
    case 'DELETE':
      // 레코드 삭제 처리
      break;
  }

  return {
    success: true,
    message: `${type} 이벤트가 처리되었습니다.`,
    processedEvent: {
      type,
      table,
      recordId,
    },
  };
};

/**
 * 웹훅 응답 생성
 *
 * @param success - 처리 성공 여부
 * @param messageOrError - 성공 메시지 또는 에러 메시지
 * @returns 웹훅 응답 객체
 */
export const createWebhookResponse = (
  success: boolean,
  messageOrError?: string
): WebhookResponse => {
  if (success) {
    return messageOrError ? { ok: true, message: messageOrError } : { ok: true };
  }

  return { ok: false, error: messageOrError };
};

/**
 * Supabase 웹훅 요청 핸들러
 * POST /api/supabase-webhook
 */
export const handleSupabaseWebhook = async (c: Context): Promise<Response> => {
  // 1. 웹훅 시크릿 검증
  const secret = c.req.header('x-webhook-secret');

  if (!verifyWebhookSecret(secret)) {
    return c.json(createWebhookResponse(false, 'Unauthorized'), 401);
  }

  // 2. 페이로드 파싱
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(createWebhookResponse(false, 'Invalid JSON payload'), 400);
  }

  // 3. 페이로드 검증
  const parseResult = parseWebhookPayload(body);
  if (!parseResult.success) {
    return c.json(createWebhookResponse(false, parseResult.error.message), 400);
  }

  // 4. 이벤트 처리
  const result = processWebhookEvent(parseResult.data);

  // 5. 응답 반환
  return c.json(createWebhookResponse(result.success, result.message));
};
