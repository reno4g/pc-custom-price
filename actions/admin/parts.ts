'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createPart(formData: FormData) {
  const supabase = createAdminClient()
  await supabase.from('parts').insert({
    category_id: formData.get('category_id') as string,
    name: formData.get('name') as string,
    spec: (formData.get('spec') as string) || null,
    is_active: formData.get('is_active') === 'true',
    sort_order: Number(formData.get('sort_order')) || 0,
  })
  revalidatePath('/admin/parts')
}

export async function updatePart(id: string, formData: FormData) {
  const supabase = createAdminClient()
  await supabase.from('parts').update({
    category_id: formData.get('category_id') as string,
    name: formData.get('name') as string,
    spec: (formData.get('spec') as string) || null,
    is_active: formData.get('is_active') === 'true',
    sort_order: Number(formData.get('sort_order')) || 0,
  }).eq('id', id)
  revalidatePath('/admin/parts')
}

export async function deletePart(id: string) {
  const supabase = createAdminClient()
  await supabase.from('parts').delete().eq('id', id)
  revalidatePath('/admin/parts')
}
