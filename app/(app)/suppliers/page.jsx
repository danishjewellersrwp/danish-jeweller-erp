import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import SuppliersClient from './SuppliersClient';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const { data: suppliers } = await supabase.from('suppliers').select('*').order('name');
  const { data: purchases } = await supabase.from('purchases').select('*');
  return <SuppliersClient initialSuppliers={suppliers || []} purchases={purchases || []} canEdit={profile?.roleConfig?.canEdit} />;
}
