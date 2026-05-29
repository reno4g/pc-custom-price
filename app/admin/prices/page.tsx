import { createAdminClient } from '@/lib/supabase/admin'
import PriceGrid from '@/components/admin/PriceGrid'
import type { CategoryWithParts, Tier } from '@/types/database'

export default async function AdminPricesPage() {
  const supabase = createAdminClient()

  const [{ data: categories }, { data: tiers }, { data: prices }] = await Promise.all([
    supabase.from('part_categories').select('*, parts(*)').order('sort_order').order('sort_order', { referencedTable: 'parts' }),
    supabase.from('tiers').select('*').order('name'),
    supabase.from('part_prices').select('part_id, tier_id, price'),
  ])

  // Build price map: part_id -> tier_id -> price
  const priceMap: Record<string, Record<string, number>> = {}
  for (const p of prices ?? []) {
    if (!priceMap[p.part_id]) priceMap[p.part_id] = {}
    priceMap[p.part_id][p.tier_id] = p.price
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">価格マスター</h1>
      <p className="text-sm text-gray-600">各セルの金額を編集してフォーカスを外すと自動保存されます</p>
      <PriceGrid
        categories={(categories ?? []) as CategoryWithParts[]}
        tiers={(tiers ?? []) as Tier[]}
        prices={priceMap}
      />
    </div>
  )
}
