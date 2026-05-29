'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/require-admin'
import { revalidatePath } from 'next/cache'

export async function upsertPrice(partId: string, tierId: string, price: number) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('part_prices').upsert(
    { part_id: partId, tier_id: tierId, price },
    { onConflict: 'part_id,tier_id' }
  )
  revalidatePath('/admin/prices')
}
