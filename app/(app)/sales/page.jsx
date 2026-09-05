import { createClient } from '@/lib/supabase/server';
import SalesClient from './SalesClient';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const supabase = createClient();
  const { data: sales } = await supabase.from('sales').select('*, sale_items(*), sale_payments(*)').order('sale_date', { ascending: false });
  const { data: customers } = await supabase.from('customers').select('*');
  return <SalesClient sales={sales || []} customers={customers || []} />;
}
