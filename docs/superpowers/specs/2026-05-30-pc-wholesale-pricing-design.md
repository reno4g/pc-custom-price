# PC卸値確認Webサイト 設計書

## 概要

取引先がPCパーツの卸値を確認・見積もりするためのWebサイト。取引先はログイン後、CPU/メモリ/SSD/HDD/グラボ/電源/PCケース/OSを自由に組み合わせ、数量を指定してPC構成を作成し、合計卸値を確認できる。構成の保存・PDF出力・印刷も可能。管理者は管理画面から価格マスター・パーツ品目・取引先アカウントを管理する。

## 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js 14 (App Router, Server Actions) |
| DB・認証 | Supabase (PostgreSQL + Auth) |
| ORM | Supabase JS Client |
| PDF出力 | @react-pdf/renderer |
| スタイリング | Tailwind CSS |
| デプロイ | Vercel |

## アーキテクチャ

```
Vercel
├── 取引先サイト (/)      ← Next.js App Router
└── 管理画面 (/admin)    ← Next.js App Router

Supabase
├── Auth (アカウント管理・招待メール)
└── PostgreSQL (価格・品目・構成データ)
```

価格計算はすべてServer Actionsで処理し、卸値データをクライアントに直接渡さない。

## データモデル

### テーブル定義

```sql
-- パーツカテゴリ (CPU, メモリ, SSD, HDD, グラボ, 電源, PCケース, OS)
part_categories (
  id            uuid PRIMARY KEY,
  name          text NOT NULL,
  max_quantity  int  NOT NULL DEFAULT 1,  -- 最大選択数量
  sort_order    int  NOT NULL
)

-- パーツ品目
parts (
  id          uuid PRIMARY KEY,
  category_id uuid REFERENCES part_categories,
  name        text NOT NULL,
  spec        text,                        -- スペック説明
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL
)

-- 取引先グループ（ティア）
tiers (
  id          uuid PRIMARY KEY,
  name        text NOT NULL,              -- 例: Aランク, Bランク
  description text
)

-- 価格マスター (パーツ × ティア)
part_prices (
  id       uuid PRIMARY KEY,
  part_id  uuid REFERENCES parts,
  tier_id  uuid REFERENCES tiers,
  price    integer NOT NULL,             -- 卸値（円）
  UNIQUE (part_id, tier_id)
)

-- ユーザープロフィール (Supabase Auth と1対1)
profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users,
  tier_id      uuid REFERENCES tiers,
  company_name text NOT NULL,
  is_admin     boolean NOT NULL DEFAULT false
)

-- 保存済みPC構成
configurations (
  id         uuid PRIMARY KEY,
  user_id    uuid REFERENCES profiles,
  name       text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- 構成の明細行
configuration_items (
  id                uuid PRIMARY KEY,
  configuration_id  uuid REFERENCES configurations,
  part_id           uuid REFERENCES parts,
  quantity          int NOT NULL DEFAULT 1
  -- 価格は保存時にスナップショットしない。表示時に現在の price_master を参照する
)
```

### Row Level Security

- `part_prices`: 取得は `tier_id = (SELECT tier_id FROM profiles WHERE id = auth.uid())` のみ
- `configurations` / `configuration_items`: 取得・更新は `user_id = auth.uid()` のみ
- `parts` / `part_categories`: 全認証ユーザーが読み取り可
- 管理系テーブル: Server Actionsのサービスロールキーでのみ書き込み

## 取引先サイト 画面構成

```
/login                  メールアドレス + パスワード
/                       構成ビルダー（メイン画面）
/configurations         保存済み構成一覧
/configurations/[id]    保存済み構成詳細・再編集・PDF出力
```

### 構成ビルダー (/)

- カテゴリごとにドロップダウン（製品選択）＋数量セレクトボックス
- 未選択カテゴリはスキップして合計計算
- 合計卸値はServer Actionで計算（クライアントに価格テーブルを渡さない）
- [構成を保存] [PDFで出力] [印刷] ボタン
- PDF帳票: 構成名・各パーツ名・数量・単価・小計・合計・発行日を含む

## 管理画面 画面構成

```
/admin                  ダッシュボード
/admin/parts            パーツ品目一覧・追加・編集・削除
/admin/parts/[id]       パーツ詳細編集
/admin/prices           価格マスター（グループ別単価のグリッド編集）
/admin/tiers            ティア一覧・追加・編集
/admin/accounts         取引先アカウント一覧・招待・停止
/admin/accounts/[id]    アカウント詳細・ティア変更
```

- `is_admin = true` のユーザーのみ `/admin` 以下にアクセス可（Next.js middleware でガード）
- アカウント発行: 管理者がメールアドレスを入力 → Supabase `inviteUserByEmail()` で招待メール送信 → 取引先が自身でパスワード設定
- パスワードリセット: /login ページの「パスワードを忘れた」リンクから Supabase 標準のリセットメール送信

## 認証フロー

```
1. 管理者: /admin/accounts でメールアドレス＋社名＋ティアを入力
2. Supabase Admin API: inviteUserByEmail() 呼び出し
3. 取引先: 招待メールのリンクからパスワード設定
4. 取引先: /login からログイン
5. Server: auth.uid() → profiles.tier_id を取得
6. 以降の価格取得: tier_id でフィルタした part_prices を使用
```

## セキュリティ対策

| 脅威 | 対策 |
|------|------|
| 他社の卸値閲覧 | RLS で自 tier_id の価格のみ取得可 |
| 管理画面への不正アクセス | middleware で is_admin チェック・リダイレクト |
| 卸値のクライアント露出 | 価格計算は Server Actions のみ |
| アカウント停止後のアクセス | Supabase Auth ban でセッション即時無効化 |

## 検証方法

1. **認証**: 取引先アカウントでログイン → 構成ビルダーが表示されること
2. **価格分離**: 異なるティアのアカウントで同パーツの価格が異なること
3. **RLS**: 取引先Aのアカウントで取引先Bの構成URLに直接アクセスできないこと
4. **管理画面ガード**: 非管理者アカウントで `/admin` にアクセスすると `/login` にリダイレクトされること
5. **PDF出力**: 構成を保存後、PDFダウンロードが正常に行われること
6. **招待フロー**: 管理画面から招待 → メール受信 → パスワード設定 → ログイン成功
