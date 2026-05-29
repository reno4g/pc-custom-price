import { getConfig, deleteConfig } from '@/actions/config'
import { getItemizedPrices } from '@/actions/price'
import { notFound } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function ConfigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const config = await getConfig(id)
  if (!config) notFound()

  const items = config.configuration_items.map(i => ({
    part_id: i.part_id,
    quantity: i.quantity,
  }))
  const lineItems = await getItemizedPrices(items)
  const total = lineItems.reduce((s, i) => s + i.subtotal, 0)

  async function handleDelete() {
    'use server'
    await deleteConfig(config!.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{config.name}</h1>
        <div className="flex gap-2">
          <Link href="/configurations" className={cn(buttonVariants({ variant: 'outline' }))}>一覧に戻る</Link>
          {/* PDFDownloadButton and PrintButton added in Task 9 */}
          <form action={handleDelete}>
            <Button variant="destructive" type="submit">削除</Button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 text-sm font-medium">パーツ名</th>
              <th className="text-right px-4 py-3 text-sm font-medium">数量</th>
              <th className="text-right px-4 py-3 text-sm font-medium">単価</th>
              <th className="text-right px-4 py-3 text-sm font-medium">小計</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map(item => (
              <tr key={item.part_id} className="border-b last:border-0">
                <td className="px-4 py-3">{item.part_name}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">¥{item.unit_price.toLocaleString('ja-JP')}</td>
                <td className="px-4 py-3 text-right font-medium">¥{item.subtotal.toLocaleString('ja-JP')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-4 py-3 text-right font-bold">合計</td>
              <td className="px-4 py-3 text-right font-bold text-lg">¥{total.toLocaleString('ja-JP')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
