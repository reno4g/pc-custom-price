'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/require-admin'
import { revalidatePath } from 'next/cache'

export async function createTier(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('tiers').insert({
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
  })
  revalidatePath('/admin/tiers')
}

export async function updateTierAction(id: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  await supabase.from('tiers').update({
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
  }).eq('id', id)
  revalidatePath('/admin/tiers')
}

export async function deleteTier(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const id = formData.get('id') as string
  await supabase.from('tiers').delete().eq('id', id)
  revalidatePath('/admin/tiers')
}
