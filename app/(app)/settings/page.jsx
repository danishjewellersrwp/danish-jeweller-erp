import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: metalRates } = await supabase.from('metal_rates').select('*').eq('id', 1).single();
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  const { data: rateHistory } = await supabase.from('rate_history').select('*').order('recorded_at', { ascending: false }).limit(15);
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, role, active, pin_hash').order('full_name');
  const currentProfile = await getCurrentProfile();

  return (
    <SettingsClient
      metalRates={metalRates} settings={settings} rateHistory={rateHistory || []}
      profiles={profiles || []} currentProfile={currentProfile}
    />
  );
}
