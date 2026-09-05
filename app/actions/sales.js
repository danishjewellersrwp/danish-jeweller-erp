'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSale({ invoiceNo, customerId, subtotal, discount, tax, total, items, payments }) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('create_sale', {
    p_invoice_no: invoiceNo,
    p_customer_id: customerId,
    p_subtotal: subtotal,
    p_discount: discount,
    p_tax: tax,
    p_total: total,
    p_items: items,
    p_payments: payments,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/pos');
  revalidatePath('/sales');
  revalidatePath('/products');
  revalidatePath('/dashboard');
  return { ok: true, saleId: data };
}

export async function nextInvoiceNumber() {
  const supabase = createClient();
  const { count } = await supabase.from('sales').select('*', { count: 'exact', head: true });
  return `INV-${1000 + (count || 0) + 1}`;
}
