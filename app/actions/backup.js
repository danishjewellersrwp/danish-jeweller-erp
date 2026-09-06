'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const TABLES_PARENT_FIRST = [
  'customers', 'suppliers', 'products',
  'sales', 'sale_items', 'sale_payments',
  'purchases', 'purchase_items',
  'customer_purchases', 'old_gold_exchanges', 'repairs', 'custom_orders', 'expenses',
  'rate_history',
];

export async function exportBackup() {
  const supabase = createClient();
  const data = {};
  for (const table of TABLES_PARENT_FIRST) {
    const { data: rows, error } = await supabase.from(table).select('*');
    if (error) return { ok: false, error: `Failed reading ${table}: ${error.message}` };
    data[table] = rows;
  }
  const { data: metalRates } = await supabase.from('metal_rates').select('*').eq('id', 1).single();
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  data.metal_rates = metalRates ? [metalRates] : [];
  data.settings = settings ? [settings] : [];

  return {
    ok: true,
    backup: {
      version: 1,
      app: 'Danish Jeweller ERP',
      exported_at: new Date().toISOString(),
      data,
    },
  };
}

// Restores from a backup produced by exportBackup(). This REPLACES all
// business data (not user accounts/logins, which are left untouched on
// purpose) -- delete children before parents, insert parents before
// children, to respect foreign keys. Admin-only in practice because RLS
// only grants delete/insert on these tables to roles that include admin.
export async function restoreBackup(backup) {
  const supabase = createClient();
  if (!backup || backup.version !== 1 || !backup.data) {
    return { ok: false, error: 'This does not look like a valid Danish Jeweller backup file.' };
  }
  const d = backup.data;

  const deleteOrder = [
    'sale_items', 'sale_payments', 'purchase_items',
    'sales', 'purchases', 'customer_purchases', 'old_gold_exchanges',
    'repairs', 'custom_orders', 'expenses', 'products', 'customers', 'suppliers', 'rate_history',
  ];
  for (const table of deleteOrder) {
    const { error } = await supabase.from(table).delete().not('id', 'is', null);
    if (error) return { ok: false, error: `Failed clearing ${table}: ${error.message}` };
  }

  const insertOrder = [
    'customers', 'suppliers', 'products',
    'sales', 'sale_items', 'sale_payments',
    'purchases', 'purchase_items',
    'customer_purchases', 'old_gold_exchanges', 'repairs', 'custom_orders', 'expenses',
    'rate_history',
  ];
  for (const table of insertOrder) {
    const rows = d[table];
    if (!rows || rows.length === 0) continue;
    const { error } = await supabase.from(table).insert(rows);
    if (error) return { ok: false, error: `Failed restoring ${table}: ${error.message}. Data before this table was already restored -- check what's missing before retrying.` };
  }

  if (d.metal_rates?.[0]) {
    const { id, ...rest } = d.metal_rates[0];
    await supabase.from('metal_rates').update(rest).eq('id', 1);
  }
  if (d.settings?.[0]) {
    const { id, ...rest } = d.settings[0];
    await supabase.from('settings').update(rest).eq('id', 1);
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
