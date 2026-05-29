# デプロイチェックリスト

## 1. Supabase セットアップ

### データベース マイグレーション
Supabase ダッシュボード → SQL Editor で以下の順に実行:
1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/migrations/003_seed_categories.sql`

### Auth 設定
Supabase ダッシュボード → Authentication → URL Configuration:
- **Site URL**: `https://<your-vercel-domain>`
- **Redirect URLs**: `https://<your-vercel-domain>/auth/callback`

### 環境変数の取得
Supabase ダッシュボード → Project Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret)

## 2. GitHub リポジトリ

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 3. Vercel デプロイ

1. Vercel ダッシュボード → New Project → Import from GitHub
2. Environment Variables に以下を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-vercel-domain>`
3. Deploy

## 4. 管理者アカウント作成

Supabase ダッシュボード → Authentication → Users → Invite user (管理者のメールアドレス)

招待メールからパスワード設定後、SQL Editor で管理者権限を付与:
```sql
UPDATE profiles SET is_admin = true WHERE id = '<your-user-id>';
```

## 5. 動作確認チェックリスト

- [ ] 管理者でログイン → `/admin` にアクセスできる
- [ ] ティアを作成（例: Aランク、Bランク）
- [ ] パーツを追加（例: CPU > Core i9-14900K）
- [ ] 価格マスターでティア別価格を設定
- [ ] 取引先アカウントを招待（別のメールアドレス）
- [ ] 取引先でログイン → PC構成ビルダーが表示される
- [ ] パーツを選択 → 卸値合計が表示される
- [ ] 構成を保存 → 保存済み構成に表示される
- [ ] 構成詳細で対応するパーツ情報とティア別価格を確認
- [ ] 別ティアの取引先で同パーツの価格が異なることを確認
- [ ] 取引先アカウントで `/admin` にアクセス → `/` にリダイレクトされる

## 注意事項

### PDF出力について
`@react-pdf/renderer`との互換性の問題により、PDF出力機能は現在無効化されています。
PDF出力が必要な場合は、以下の選択肢を検討してください:

1. **ブラウザ標準のPrint機能を利用** - `Ctrl+P` / `Cmd+P` で印刷可能
2. **サーバーサイドPDF生成ライブラリの利用** - `pdfkit` や `puppeteer` など
3. **別プロセスでの PDF 生成** - 専用の API エンドポイントを追加

### Middleware の廃止予定について
現在の実装で `middleware.ts` を使用していますが、Next.js では `proxy` への移行が推奨されています。
将来のバージョンアップの際に対応を検討してください。
参考: https://nextjs.org/docs/messages/middleware-to-proxy
