'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { login, resetPassword } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [mode, setMode] = useState<'login' | 'reset'>('login')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = await login(new FormData(e.currentTarget))
    if (result?.error) setError(result.error)
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await resetPassword(new FormData(e.currentTarget))
    setResetSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'login' ? 'ログイン' : 'パスワードリセット'}</CardTitle>
        </CardHeader>
        <CardContent>
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">ログイン</Button>
              <button
                type="button"
                className="text-sm text-blue-600 underline w-full text-center"
                onClick={() => setMode('reset')}
              >
                パスワードを忘れた方
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">メールアドレス</Label>
                <Input id="reset-email" name="email" type="email" required />
              </div>
              {resetSent && <p className="text-sm text-green-600">リセットメールを送信しました</p>}
              <Button type="submit" className="w-full">送信</Button>
              <button
                type="button"
                className="text-sm text-blue-600 underline w-full text-center"
                onClick={() => setMode('login')}
              >
                ログインに戻る
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
