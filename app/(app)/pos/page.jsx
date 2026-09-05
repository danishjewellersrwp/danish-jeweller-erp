import { createClient } from '@/lib/supabase/server';
import POSClient from './POSClient';

export const dynamic = 'force-dynamic';

export default async function POSPage() {
  const supabase = createClient();
  const { data: products } = await supabase.from('products').select('*').gt('qty', 0).order('name');
  const { data: customers } = await supabase.from('customers').select('*').order('name');
  const { data: metalRates } = await supabase.from('metal_rates').select('*').eq('id', 1).single();
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();

  return <POSClient initialProducts={products || []} customers={customers || []} metalRates={metalRates} settings={settings} />;
}
