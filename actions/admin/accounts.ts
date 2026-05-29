'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function inviteAccount(formData: FormData) {
  const supabase = createAdminClient()
  const email = formData.get('email') as string
  const companyName = formData.get('company_name') as string
  const tierId = formData.get('tier_id') as string

  const { data: user, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { company_name: companyName },
  })
  if (error) return { error: error.message }

  // Update the auto-created profile with company_name and tier_id
  await supabase.from('profiles').update({ company_name: companyName, tier_id: tierId })
    .eq('id', user.user.id)

  revalidatePath('/admin/accounts')
  return { success: true }
}

export async function updateAccountTier(userId: string, tierId: string) {
  const supabase = createAdminClient()
  await supabase.from('profiles').update({ tier_id: tierId }).eq('id', userId)
  revalidatePath('/admin/accounts')
}

export async function banAccount(userId: string) {
  const supabase = createAdminClient()
  await supabase.auth.admin.updateUserById(userId, { ban_duration: '876600h' }) // 100 years
  revalidatePath('/admin/accounts')
}

export async function unbanAccount(userId: string) {
  const supabase = createAdminClient()
  await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' })
  revalidatePath('/admin/accounts')
}
