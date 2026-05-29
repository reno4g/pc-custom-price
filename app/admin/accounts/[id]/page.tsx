import { createAdminClient } from '@/lib/supabase/admin'
import { updateAccountTier } from '@/actions/admin/accounts'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const [{ data: profile }, { data: tiers }, { data: userData }] = await Promise.all([
    supabase.from('profiles').select('*, tiers(name)').eq('id', id).single(),
    supabase.from('tiers').select('*').order('name'),
    supabase.auth.admin.getUserById(id),
  ])

  if (!profile) redirect('/admin/accounts')

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateAccountTier(id, formData.get('tier_id') as string)
    redirect('/admin/accounts')
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">アカウント詳細</h1>
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <span className="text-sm text-gray-600">会社名</span>
          <p className="font-medium">{profile.company_name}</p>
        </div>
        <div>
          <span className="text-sm text-gray-600">メール</span>
          <p>{userData?.user?.email}</p>
        </div>
        <form action={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label>ティア</Label>
            <select
              name="tier_id"
              defaultValue={profile.tier_id ?? ''}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">未設定</option>
              {(tiers ?? []).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <Button type="submit">保存</Button>
            <Link
              href="/admin/accounts"
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
