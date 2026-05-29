'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { inviteAccount } from '@/actions/admin/accounts'
import { buttonVariants } from '@/components/ui/button'
import type { Tier } from '@/types/database'

export default function InviteDialog({ tiers }: { tiers: Tier[] }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const result = await inviteAccount(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false) }, 1500)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>
        取引先を招待
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>取引先アカウント招待</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>メールアドレス</Label>
            <Input name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label>会社名</Label>
            <Input name="company_name" required />
          </div>
          <div className="space-y-2">
            <Label>ティア</Label>
            <select
              name="tier_id"
              required
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">選択してください</option>
              {tiers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">招待メールを送信しました</p>}
          <Button type="submit" className="w-full">招待メールを送信</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
