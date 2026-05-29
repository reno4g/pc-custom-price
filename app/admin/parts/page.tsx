import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CategoryWithParts, Part } from '@/types/database'

export default async function AdminPartsPage() {
  const supabase = createAdminClient()
  const { data: categories } = await supabase
    .from('part_categories')
    .select('*, parts(*)')
    .order('sort_order')
    .order('sort_order', { referencedTable: 'parts' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">パーツ管理</h1>
        <Link href="/admin/parts/new" className={cn(buttonVariants())}>新規追加</Link>
      </div>
      {((categories ?? []) as CategoryWithParts[]).map(cat => (
        <div key={cat.id} className="bg-white rounded-lg border">
          <div className="px-4 py-3 border-b bg-gray-50 font-medium">{cat.name}</div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">製品名</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">スペック</th>
                <th className="px-4 py-2 text-sm font-medium text-gray-600">状態</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(cat.parts ?? []).map((part: Part) => (
                <tr key={part.id} className="border-b last:border-0">
                  <td className="px-4 py-2">{part.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{part.spec}</td>
                  <td className="px-4 py-2 text-center">
                    <Badge variant={part.is_active ? 'default' : 'secondary'}>
                      {part.is_active ? '有効' : '無効'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/parts/${part.id}`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
