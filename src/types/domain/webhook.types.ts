/**
 * Webhook 도메인 타입 정의
 *
 * Supabase Database Webhook 페이로드 관련 타입을 정의합니다.
 */

/** 웹훅 이벤트 타입 */
export type WebhookEventType = 'INSERT' | 'UPDATE' | 'DELETE';

/** 웹훅 대상 테이블 */
export type WebhookTable = 'messages' | 'rooms' | 'room_members' | 'reactions' | 'bookmarks';

/** 메시지 레코드 (Supabase 테이블 스키마) */
export interface MessageRecord {
  readonly id: string;
  readonly room_id: string;
  readonly user_id: string;
  readonly content: string;
  readonly created_at: string;
  readonly deleted_at: string | null;
}

/** 일반 레코드 타입 (확장 가능) */
export type WebhookRecord = MessageRecord | Record<string, unknown>;

/** Supabase 웹훅 페이로드 */
export interface WebhookPayload<T extends WebhookRecord = WebhookRecord> {
  readonly type: WebhookEventType;
  readonly table: WebhookTable;
  readonly record: T;
  readonly old_record: T | null;
}

/** 웹훅 처리 결과 */
export interface WebhookHandlerResult {
  readonly success: boolean;
  readonly message?: string;
  readonly processedEvent?: {
    readonly type: WebhookEventType;
    readonly table: WebhookTable;
    readonly recordId: string | null;
  };
}
