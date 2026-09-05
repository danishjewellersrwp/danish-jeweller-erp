import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import OldGoldClient from './OldGoldClient';

export const dynamic = 'force-dynamic';

export default async function OldGoldPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const { data: exchanges } = await supabase.from('old_gold_exchanges').select('*').order('exchange_date', { ascending: false });
  const { data: customers } = await supabase.from('customers').select('*');
  const { data: metalRates } = await supabase.from('metal_rates').select('*').eq('id', 1).single();
  return <OldGoldClient initialExchanges={exchanges || []} customers={customers || []} metalRates={metalRates} canEdit={profile?.roleConfig?.canEdit} />;
}
