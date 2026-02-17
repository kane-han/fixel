import { createClient } from '@supabase/supabase-js';

/**
 * Service Role Key 기반 Admin 클라이언트
 * - RLS 우회, 서버 전용 (Storage 관리 등)
 * - 절대 클라이언트에 노출하지 말 것
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
