import { createClient } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: metalRates } = await supabase.from('metal_rates').select('*').eq('id', 1).single();
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  const { data: rateHistory } = await supabase.from('rate_history').select('*').order('recorded_at', { ascending: false }).limit(15);

  return <SettingsClient metalRates={metalRates} settings={settings} rateHistory={rateHistory || []} />;
}
