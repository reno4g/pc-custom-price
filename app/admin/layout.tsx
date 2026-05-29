import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'ダッシュボード' },
  { href: '/admin/parts', label: 'パーツ管理' },
  { href: '/admin/prices', label: '価格マスター' },
  { href: '/admin/tiers', label: 'ティア管理' },
  { href: '/admin/accounts', label: 'アカウント管理' },
]

async function adminLogout() {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="px-4 py-5 font-bold text-lg border-b border-gray-700">管理画面</div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={adminLogout} className="p-4 border-t border-gray-700">
          <button type="submit" className="text-sm text-gray-400 hover:text-white">ログアウト</button>
        </form>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  )
}
