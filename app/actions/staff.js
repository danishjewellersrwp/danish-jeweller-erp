'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const FN_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function listActiveStaff() {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('list_active_staff');
  if (error) return [];
  return data || [];
}

export async function pinLogin(profileId, pin) {
  try {
    const res = await fetch(`${FN_BASE}/pin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
      body: JSON.stringify({ profile_id: profileId, pin }),
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, error: data.error || 'Incorrect PIN.' };

    const supabase = createClient();
    const { error } = await supabase.auth.setSession({
      access_token: data.access_token, refresh_token: data.refresh_token,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: 'Could not reach the sign-in service. Check your connection.' };
  }
}

async function callAsCurrentUser(fnName, body) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'Not signed in.' };
  const res = await fetch(`${FN_BASE}/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function createEmployee({ fullName, role, pin, email }) {
  const result = await callAsCurrentUser('create-employee', { full_name: fullName, role, pin, email });
  if (result.ok) revalidatePath('/settings');
  return result;
}

export async function setPin({ targetProfileId, pin }) {
  const result = await callAsCurrentUser('set-pin', { target_profile_id: targetProfileId, pin });
  if (result.ok) revalidatePath('/settings');
  return result;
}
