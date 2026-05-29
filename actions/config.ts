'use server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ConfigItem } from './price'
import type { ConfigurationWithItems } from '@/types/database'

async function getCurrentUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function saveConfig(name: string, items: ConfigItem[]): Promise<void> {
  const userId = await getCurrentUserId()
  const supabase = await createSupabaseServerClient()

  const { data: config, error } = await supabase
    .from('configurations')
    .insert({ name, user_id: userId })
    .select('id')
    .single()
  if (error || !config) throw new Error('Failed to save configuration')

  await supabase.from('configuration_items').insert(
    items.map(i => ({ configuration_id: config.id, part_id: i.part_id, quantity: i.quantity }))
  )

  redirect(`/configurations/${config.id}`)
}

export async function listConfigs() {
  const userId = await getCurrentUserId()
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('configurations')
    .select('id, name, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  return data ?? []
}

export async function getConfig(id: string): Promise<ConfigurationWithItems | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('configurations')
    .select('*, configuration_items(*, parts(*))')
    .eq('id', id)
    .single()
  return data as ConfigurationWithItems | null
}

export async function deleteConfig(id: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.from('configurations').delete().eq('id', id)
  redirect('/configurations')
}
