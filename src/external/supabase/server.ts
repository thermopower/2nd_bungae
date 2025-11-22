/**
 * Supabase 서버 클라이언트 팩토리
 *
 * 서버 사이드(API Routes, Server Components)에서 Supabase에 접근할 때 사용합니다.
 * Service Role Key를 사용하여 RLS를 우회합니다.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * 서버용 Supabase 클라이언트를 생성합니다.
 * Service Role Key를 사용하므로 서버에서만 사용해야 합니다.
 * @returns Supabase 클라이언트 인스턴스
 */
export const createServerClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

/** 서버 클라이언트 타입 */
export type ServerClient = ReturnType<typeof createServerClient>;
