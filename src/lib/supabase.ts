import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _public: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!_public) {
    _public = createClient(url, anonKey, {
      auth: { persistSession: false }
    });
  }
  return _public;
}

export function getAdminClient(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!_admin) {
    _admin = createClient(url, serviceKey, {
      auth: { persistSession: false }
    });
  }
  return _admin;
}

export const isSupabaseConfigured = Boolean(url && anonKey);
