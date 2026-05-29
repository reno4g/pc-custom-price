import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function logout() {
  'use server'
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('company_name').eq('id', user.id).single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-gray-900">PC構成ビルダー</Link>
          <Link href="/configurations" className="text-sm text-gray-600 hover:text-gray-900">
            保存済み構成
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{profile?.company_name}</span>
          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">ログアウト</Button>
          </form>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
