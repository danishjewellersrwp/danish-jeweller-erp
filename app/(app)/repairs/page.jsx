import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import RepairsClient from './RepairsClient';

export const dynamic = 'force-dynamic';

export default async function RepairsPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const { data: repairs } = await supabase.from('repairs').select('*').order('repair_date', { ascending: false });
  const { data: customers } = await supabase.from('customers').select('*');
  return <RepairsClient initialRepairs={repairs || []} customers={customers || []} canEdit={profile?.roleConfig?.canEdit} />;
}
