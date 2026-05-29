'use server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type ConfigItem = { part_id: string; quantity: number }

export type PriceLineItem = {
  part_id: string
  part_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export async function computeTotal(
  items: ConfigItem[],
  prices: Array<{ part_id: string; price: number }>
): Promise<number> {
  return items.reduce((total, item) => {
    const price = prices.find(p => p.part_id === item.part_id)
    return total + (price?.price ?? 0) * item.quantity
  }, 0)
}

async function getTierPrices(partIds: string[]) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles').select('tier_id').eq('id', user.id).single()
  if (!profile?.tier_id) throw new Error('No tier assigned')

  const { data } = await supabase
    .from('part_prices')
    .select('part_id, price')
    .eq('tier_id', profile.tier_id)
    .in('part_id', partIds)

  return data ?? []
}

export async function calculateTotal(items: ConfigItem[]): Promise<number> {
  if (items.length === 0) return 0
  const prices = await getTierPrices(items.map(i => i.part_id))
  return computeTotal(items, prices)
}

export async function getItemizedPrices(items: ConfigItem[]): Promise<PriceLineItem[]> {
  if (items.length === 0) return []
  const supabase = await createSupabaseServerClient()
  const prices = await getTierPrices(items.map(i => i.part_id))

  const { data: parts } = await supabase
    .from('parts').select('id, name').in('id', items.map(i => i.part_id))

  return items.map(item => {
    const price = prices.find(p => p.part_id === item.part_id)?.price ?? 0
    const part = parts?.find(p => p.id === item.part_id)
    return {
      part_id: item.part_id,
      part_name: part?.name ?? '',
      quantity: item.quantity,
      unit_price: price,
      subtotal: price * item.quantity,
    }
  })
}
