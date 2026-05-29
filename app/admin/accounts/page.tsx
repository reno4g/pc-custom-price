import { createAdminClient } from '@/lib/supabase/admin'
import { banAccount, unbanAccount } from '@/actions/admin/accounts'
import InviteDialog from '@/components/admin/InviteDialog'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function AdminAccountsPage() {
  const supabase = createAdminClient()
  const [{ data: profiles }, { data: tiers }, { data: usersData }] = await Promise.all([
    supabase.from('profiles').select('*, tiers(name)').eq('is_admin', false),
    supabase.from('tiers').select('*').order('name'),
    supabase.auth.admin.listUsers(),
  ])

  const users = usersData?.users ?? []
  const bannedIds = new Set(
    users
      .filter(u => u.banned_until && new Date(u.banned_until) > new Date())
      .map(u => u.id)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">アカウント管理</h1>
        <InviteDialog tiers={tiers ?? []} />
      </div>

      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 text-sm font-medium">会社名</th>
              <th className="text-left px-4 py-3 text-sm font-medium">メール</th>
              <th className="text-left px-4 py-3 text-sm font-medium">ティア</th>
              <th className="px-4 py-3 text-sm font-medium">状態</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map(profile => {
              const isBanned = bannedIds.has(profile.id)
              const user = users.find(u => u.id === profile.id)
              return (
                <tr key={profile.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{profile.company_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user?.email}</td>
                  <td className="px-4 py-3 text-sm">{(profile as any).tiers?.name ?? '未設定'}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={isBanned ? 'destructive' : 'default'}>
                      {isBanned ? '停止中' : '有効'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/accounts/${profile.id}`}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                      >
                        編集
                      </Link>
                      <form action={async (fd: FormData) => {
                        'use server'
                        const id = fd.get('id') as string
                        const banned = fd.get('banned') === 'true'
                        if (banned) await unbanAccount(id)
                        else await banAccount(id)
                      }}>
                        <input type="hidden" name="id" value={profile.id} />
                        <input type="hidden" name="banned" value={String(isBanned)} />
                        <button
                          type="submit"
                          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ${
                            isBanned
                              ? 'border border-input bg-background hover:bg-accent'
                              : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          }`}
                        >
                          {isBanned ? '解除' : '停止'}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
