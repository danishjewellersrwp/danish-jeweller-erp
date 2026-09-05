import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import CustomOrdersClient from './CustomOrdersClient';

export const dynamic = 'force-dynamic';

export default async function CustomOrdersPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const { data: orders } = await supabase.from('custom_orders').select('*').order('order_date', { ascending: false });
  const { data: customers } = await supabase.from('customers').select('*');
  return <CustomOrdersClient initialOrders={orders || []} customers={customers || []} canEdit={profile?.roleConfig?.canEdit} />;
}
