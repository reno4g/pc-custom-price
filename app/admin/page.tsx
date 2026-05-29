import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminDashboard() {
  const supabase = createAdminClient()
  const [{ count: partsCount }, { count: accountsCount }] = await Promise.all([
    supabase.from('parts').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', false),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold">{partsCount ?? 0}</div>
          <div className="text-sm text-gray-600">登録パーツ数</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold">{accountsCount ?? 0}</div>
          <div className="text-sm text-gray-600">取引先アカウント数</div>
        </div>
      </div>
    </div>
  )
}
