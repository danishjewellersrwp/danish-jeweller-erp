'use server';
import { createClient } from '@/lib/supabase/server';
import { fetchLiveMetalRates, OZ_TO_GRAM } from '@/lib/pricing';
import { revalidatePath } from 'next/cache';

// This runs entirely on the server (a Vercel function), so unlike the
// browser-side fetch in the prototype, this can never be blocked by a
// sandboxed preview or client-side CORS policy. It still never overwrites a
// good rate on failure — RLS also means only admin/manager can actually
// write the update (everyone else gets a clean permission error).
export async function refreshLiveRates() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  try {
    const { goldUsdOz, silverUsdOz } = await fetchLiveMetalRates();
    const { data: current, error: readErr } = await supabase.from('metal_rates').select('*').eq('id', 1).single();
    if (readErr) throw new Error(readErr.message);

    const usd = current.usd_to_pkr;
    const goldPerGram = Math.round((goldUsdOz / OZ_TO_GRAM) * usd);
    const silverPerGram = Math.round((silverUsdOz / OZ_TO_GRAM) * usd);

    const { error: updErr } = await supabase.from('metal_rates').update({
      prev_gold_pure_per_gram: current.gold_pure_per_gram,
      prev_silver_pure_per_gram: current.silver_pure_per_gram,
      gold_pure_per_gram: goldPerGram,
      silver_pure_per_gram: silverPerGram,
      last_updated: new Date().toISOString(),
      source: 'AURUM live (COMEX GC=F/SI=F via Yahoo Finance)',
      fetch_status: 'ok',
      fetch_error: null,
    }).eq('id', 1);
    if (updErr) throw new Error(updErr.message);

    await supabase.from('rate_history').insert({
      gold: goldPerGram, silver: silverPerGram, source: 'AURUM live (COMEX GC=F/SI=F)',
    });

    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (e) {
    await supabase.from('metal_rates').update({ fetch_status: 'error', fetch_error: e.message }).eq('id', 1);
    revalidatePath('/', 'layout');
    return { ok: false, error: e.message };
  }
}

export async function saveManualRates({ goldPurePerGram, silverPurePerGram, usdToPkr }) {
  const supabase = createClient();
  const { data: current, error: readErr } = await supabase.from('metal_rates').select('*').eq('id', 1).single();
  if (readErr) return { ok: false, error: readErr.message };

  const { error } = await supabase.from('metal_rates').update({
    prev_gold_pure_per_gram: current.gold_pure_per_gram,
    prev_silver_pure_per_gram: current.silver_pure_per_gram,
    gold_pure_per_gram: goldPurePerGram,
    silver_pure_per_gram: silverPurePerGram,
    usd_to_pkr: usdToPkr,
    last_updated: new Date().toISOString(),
    source: 'Manual entry',
    fetch_status: null,
    fetch_error: null,
  }).eq('id', 1);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/', 'layout');
  return { ok: true };
}
