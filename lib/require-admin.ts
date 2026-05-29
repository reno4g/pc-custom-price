import { createSupabaseServerClient } from './supabase/server'

export async function requireAdmin(): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) throw new Error('Forbidden')
}
