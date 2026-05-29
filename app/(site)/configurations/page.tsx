import { listConfigs } from '@/actions/config'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function ConfigurationsPage() {
  const configs = await listConfigs()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">保存済み構成</h1>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>新規作成</Link>
      </div>
      {configs.length === 0 ? (
        <p className="text-gray-500">保存済みの構成はありません</p>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {configs.map(c => (
            <Link key={c.id} href={`/configurations/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <span className="font-medium">{c.name}</span>
              <span className="text-sm text-gray-500">
                {new Date(c.updated_at).toLocaleDateString('ja-JP')}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
