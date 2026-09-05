import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  const { data: metalRates } = await supabase.from('metal_rates').select('*').eq('id', 1).single();
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();

  return <ProductsClient initialProducts={products || []} metalRates={metalRates} settings={settings} canEdit={profile?.roleConfig?.canEdit} />;
}
