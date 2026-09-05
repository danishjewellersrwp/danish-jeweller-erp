import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import ExpensesClient from './ExpensesClient';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const { data: expenses } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
  return <ExpensesClient initialExpenses={expenses || []} canEdit={profile?.roleConfig?.canEdit} />;
}
