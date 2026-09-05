import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import CustomersClient from './CustomersClient';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const { data: customers } = await supabase.from('customers').select('*').order('name');
  const { data: sales } = await supabase.from('sales').select('*');
  return <CustomersClient initialCustomers={customers || []} sales={sales || []} canEdit={profile?.roleConfig?.canEdit} />;
}
