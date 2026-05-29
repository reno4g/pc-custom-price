import { createAdminClient } from '@/lib/supabase/admin'
import { updatePart, createPart } from '@/actions/admin/parts'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function PartEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const isNew = id === 'new'

  const [{ data: categories }, { data: part }] = await Promise.all([
    supabase.from('part_categories').select('*').order('sort_order'),
    isNew ? { data: null } : supabase.from('parts').select('*').eq('id', id).single(),
  ])

  async function handleSubmit(formData: FormData) {
    'use server'
    if (isNew) {
      await createPart(formData)
    } else {
      await updatePart(id, formData)
    }
    redirect('/admin/parts')
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">{isNew ? 'パーツ新規追加' : 'パーツ編集'}</h1>
      <form action={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
        <div className="space-y-2">
          <Label>カテゴリ</Label>
          <select name="category_id" defaultValue={part?.category_id ?? ''} required
            className="w-full border rounded-md px-3 py-2 text-sm">
            <option value="">選択してください</option>
            {(categories ?? []).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>製品名</Label>
          <Input name="name" defaultValue={part?.name ?? ''} required />
        </div>
        <div className="space-y-2">
          <Label>スペック説明</Label>
          <Input name="spec" defaultValue={part?.spec ?? ''} />
        </div>
        <div className="space-y-2">
          <Label>表示順</Label>
          <Input name="sort_order" type="number" defaultValue={part?.sort_order ?? 0} />
        </div>
        <div className="space-y-2">
          <Label>状態</Label>
          <select name="is_active" defaultValue={String(part?.is_active ?? true)}
            className="w-full border rounded-md px-3 py-2 text-sm">
            <option value="true">有効</option>
            <option value="false">無効</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button type="submit" className={cn(buttonVariants())}>保存</button>
          <Link href="/admin/parts" className={cn(buttonVariants({ variant: 'outline' }))}>
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
