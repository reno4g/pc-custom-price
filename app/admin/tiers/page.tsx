import { createAdminClient } from '@/lib/supabase/admin'
import { createTier, deleteTier } from '@/actions/admin/tiers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default async function AdminTiersPage() {
  const supabase = createAdminClient()
  const { data: tiers } = await supabase.from('tiers').select('*').order('name')

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">ティア管理</h1>

      <form action={createTier} className="bg-white rounded-lg border p-4 flex gap-3">
        <Input name="name" placeholder="ティア名 (例: Aランク)" required className="max-w-xs" />
        <Input name="description" placeholder="説明（任意）" className="flex-1" />
        <Button type="submit">追加</Button>
      </form>

      <div className="bg-white rounded-lg border divide-y">
        {(tiers ?? []).map(tier => (
          <div key={tier.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="font-medium">{tier.name}</span>
              {tier.description && <span className="text-sm text-gray-500 ml-3">{tier.description}</span>}
            </div>
            <form action={deleteTier} className="flex gap-2">
              <input type="hidden" name="id" value={tier.id} />
              <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                削除
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
