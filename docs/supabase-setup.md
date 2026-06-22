# Supabase / Vercel セットアップ手順

この手順は、Supabaseを正本として月次面談アジェンダを管理するための初期設定です。

## 1. Supabaseプロジェクトを作成する

1. Supabaseで新規プロジェクトを作成します。
2. Project URL と publishable key を控えます。
3. Secret key や旧service role key はブラウザやGitHubへ置かないでください。

## 2. DBスキーマを作成する

Supabase SQL Editorで、リポジトリ内の次のSQLを実行します。

```text
supabase/schema.sql
```

作成される主なテーブル:

- `clients`
- `meetings`
- `agenda_items`
- `internal_notes`
- `exports`
- `profiles`

すべての業務テーブルでRow Level Securityを有効化します。

現時点のRLSは、認証済み職員が事務所内の全顧客データを扱える共同利用モデルです。担当者別・拠点別の制限が必要になった場合は、`clients` と `profiles` に権限テーブルを追加してください。

## 3. Supabase Authを設定する

最低限、メールリンクログインを使います。

1. Supabase AuthのEmail providerを有効にします。
2. 職員のメールアドレスでログインできることを確認します。
3. 退職者や権限を外す職員は、Supabase Auth側で無効化します。

## 4. Vercelへ環境変数を設定する

VercelのProject Settingsで以下を設定します。

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

注意:

- `NEXT_PUBLIC_` が付くためブラウザへ公開されます。
- publishable keyはRLSと組み合わせてブラウザから使う前提のキーです。
- secret keyや旧service role keyは絶対に設定しないでください。

## 5. ローカル開発

`.env.example` を `.env.local` にコピーして、Supabaseの値を入れます。

```powershell
npm.cmd install
npm.cmd run dev
```

ブラウザで次を開きます。

```text
http://localhost:3000
```

## 6. 動作確認

1. ログインリンクで職員ログインする。
2. 架空の顧客を登録する。
3. 前月の面談を作成し、未完了事項を登録する。
4. 翌月の面談を作成する。
5. 前月の未完了・繰越対象事項が「過去について」に自動表示されることを確認する。
6. `done` / `withdrawn` / `carry_forward=false` は繰越されないことを確認する。
7. `visibility=internal` が顧客共有用出力に出ないことを確認する。
8. Stock貼付用要約を生成・コピーできることを確認する。
9. JSONエクスポートに `sourceOfTruth: "supabase"` が入ることを確認する。

## 7. 本番運用前の確認

- 実在顧客データをGitHubに置いていない。
- `.env.local` をコミットしていない。
- RLSが有効である。
- Authの職員管理ルールが決まっている。
- 退職者のアカウント停止手順が決まっている。
- バックアップ方針を確認している。
- 顧客共有用出力に内部メモが混入しないことを人間が確認している。
