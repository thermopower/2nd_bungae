/**
 * Supabase 데이터베이스 타입 정의
 *
 * 이 파일은 Supabase CLI로 자동 생성할 수 있습니다:
 * npx supabase gen types typescript --local > src/external/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nickname: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nickname?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nickname?: string | null;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          created_by: string;
          name: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
      };
      room_members: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: never;
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          content: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          content?: string;
          deleted_at?: string | null;
        };
      };
      reactions: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
      };
      bookmarks: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

/** 테이블 이름 타입 */
export type TableName = keyof Database['public']['Tables'];

/** 테이블 Row 타입 추출 헬퍼 */
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];

/** 테이블 Insert 타입 추출 헬퍼 */
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

/** 테이블 Update 타입 추출 헬퍼 */
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];
