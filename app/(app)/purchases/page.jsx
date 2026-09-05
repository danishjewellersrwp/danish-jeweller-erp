import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import PurchasesClient from './PurchasesClient';

export const dynamic = 'force-dynamic';

export default async function PurchasesPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const { data: purchases } = await supabase.from('purchases').select('*').order('purchase_date', { ascending: false });
  const { data: customerPurchases } = await supabase.from('customer_purchases').select('*').order('purchase_date', { ascending: false });
  const { data: suppliers } = await supabase.from('suppliers').select('*');
  const { data: customers } = await supabase.from('customers').select('*');
  const { data: metalRates } = await supabase.from('metal_rates').select('*').eq('id', 1).single();

  return (
    <PurchasesClient
      initialPurchases={purchases || []} initialCustomerPurchases={customerPurchases || []}
      suppliers={suppliers || []} customers={customers || []} metalRates={metalRates}
      canEdit={profile?.roleConfig?.canEdit}
    />
  );
}
