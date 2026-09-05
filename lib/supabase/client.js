import { createBrowserClient } from '@supabase/ssr';

// Used inside Client Components ('use client'). Reads the two public
// NEXT_PUBLIC_ env vars — safe to expose, these are anon/publishable keys.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
