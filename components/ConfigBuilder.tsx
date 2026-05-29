'use client'
import { useState, useTransition } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { calculateTotal } from '@/actions/price'
import { saveConfig } from '@/actions/config'
import type { CategoryWithParts } from '@/types/database'

type Selection = { part_id: string; quantity: number }

export default function ConfigBuilder({ categories }: { categories: CategoryWithParts[] }) {
  const [selections, setSelections] = useState<Record<string, Selection>>({})
  const [total, setTotal] = useState<number | null>(null)
  const [configName, setConfigName] = useState('')
  const [saving, setSaving] = useState(false)
  const [isPending, startTransition] = useTransition()

  function updateSelection(categoryId: string, partId: string, quantity: number) {
    const next = { ...selections, [categoryId]: { part_id: partId, quantity } }
    setSelections(next)
    const items = Object.values(next).filter(s => s.part_id)
    startTransition(async () => {
      const t = await calculateTotal(items)
      setTotal(t)
    })
  }

  async function handleSave() {
    const items = Object.values(selections).filter(s => s.part_id)
    if (!configName.trim() || items.length === 0) return
    setSaving(true)
    await saveConfig(configName, items)
    setSaving(false)
  }

  const items = Object.values(selections).filter(s => s.part_id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">PC構成ビルダー</h1>
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">カテゴリ</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">製品</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 w-24">数量</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-sm font-medium">{cat.name}</td>
                <td className="px-4 py-3">
                  <Select
                    onValueChange={v => v && updateSelection(cat.id, v, selections[cat.id]?.quantity ?? 1)}
                    value={selections[cat.id]?.part_id ?? ''}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {cat.parts.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}{p.spec ? ` — ${p.spec}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Select
                    disabled={!selections[cat.id]?.part_id}
                    value={String(selections[cat.id]?.quantity ?? 1)}
                    onValueChange={v =>
                      selections[cat.id]?.part_id &&
                      updateSelection(cat.id, selections[cat.id].part_id, Number(v))
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: cat.max_quantity }, (_, i) => i + 1).map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total !== null && (
        <div className="text-right text-xl font-bold">
          合計卸値: ¥{total.toLocaleString('ja-JP')}
          {isPending && <span className="text-sm font-normal text-gray-500 ml-2">計算中...</span>}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Input
          placeholder="構成名を入力"
          value={configName}
          onChange={e => setConfigName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleSave} disabled={saving || items.length === 0 || !configName.trim()}>
          {saving ? '保存中...' : '構成を保存'}
        </Button>
      </div>
    </div>
  )
}
