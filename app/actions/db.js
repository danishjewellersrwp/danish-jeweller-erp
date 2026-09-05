'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// These are intentionally generic. Safety doesn't come from restricting which
// table names can be passed here — it comes from Postgres Row-Level Security,
// which applies no matter which table a signed-in user's role tries to touch.
export async function dbInsert(table, payload, revalidate) {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (revalidate) revalidatePath(revalidate);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}
export async function dbUpdate(table, id, payload, revalidate) {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
  if (revalidate) revalidatePath(revalidate);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}
export async function dbDelete(table, id, revalidate) {
  const supabase = createClient();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (revalidate) revalidatePath(revalidate);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
