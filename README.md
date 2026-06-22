# junkai-junbi

Supabaseを正本とする月次面談アジェンダ管理ツールです。

このツールは、月次面談のアジェンダ、繰越事項、面談結果、内部メモをSupabase上で管理します。Stockは必要に応じて要約文を貼り付ける共有先・控えとして使えますが、このツールの正本ではありません。

## 位置づけ

- 正本データはSupabase Postgresです。
- Vercelで画面を配信し、Supabase Authで職員ログインします。
- 前回JSONのダウンロード・読込・今回JSON添付を通常運用から外します。
- 前月の未完了事項は、同一顧客の前月面談データから自動繰越します。
- 顧客共有用出力と内部用メモは、`visibility` と `internal_notes` で分離します。
- Stock API連携、Stock画面のスクレイピング、自動ログインは行いません。
- TKCの巡回監査機能、税務判断自動化、異常値判定は実装しません。

## 技術構成

- Vercel / Next.js
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- 必要に応じてJSONエクスポート

## セットアップ

1. Supabaseプロジェクトを作成する。
2. `supabase/schema.sql` をSupabase SQL Editorで実行する。
3. Supabase Authで職員ユーザーを登録できる状態にする。
4. Vercelにこのリポジトリを接続する。
5. Vercel環境変数に次を設定する。

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

ローカル開発では `.env.example` を `.env.local` にコピーして値を設定します。

```powershell
npm.cmd install
npm.cmd run dev
```

詳細は `docs/supabase-setup.md` を参照してください。

## 運用フロー

1. 職員がログインする。
2. 顧客を選択、または新規登録する。
3. 対象月の面談を作成する。
4. 同一顧客の前月面談がある場合、未完了かつ繰越対象の事項が自動で「過去について」に入る。
5. 「過去について・現在について・未来について」の3軸でアジェンダを整理する。
6. 面談後、決定事項、顧客側宿題、事務所側宿題、内部メモを入力する。
7. 顧客共有用アジェンダ、内部用メモ、Stock貼付用要約を確認する。
8. 必要に応じて顧客共有用アジェンダまたは内部用メモを印刷する。
9. 必要に応じてStockへ要約を貼る。
10. 完了チェックを行う。

## アジェンダの時間軸

アジェンダは「前回の話・今回の話・次回の話」ではなく、「過去について・現在について・未来について」の3軸で整理します。

- 過去について: 過去実績、前月からの繰越、過去の決定事項や宿題の実施状況。
- 現在について: 現在の資金繰り、納付予定、中間納税の納付額・納付時期、現在の課題や相談事項。
- 未来について: 業績着地予測、短期経営計画、今後の打ち手、次月以降へ繰り越す宿題。

## 繰越ルール

次の条件をすべて満たす前月項目だけを、対象月作成時に自動繰越します。

- `carry_forward=true`
- `status` が `done` ではない
- `status` が `withdrawn` ではない

`open`, `in_progress`, `on_hold` は繰越対象です。今回画面で `done` または `withdrawn` にした項目は、次月作成時には自動繰越されません。

## 公開範囲

- `visibility=client`: 顧客共有用出力と内部用出力に表示
- `visibility=internal`: 内部用出力とStock貼付用要約の内部メモ欄にのみ表示
- `internal_notes`: 顧客共有用出力には表示しない

## 守秘と権限

- 顧客データをGitHubリポジトリへ置かない。
- Supabaseのsecret keyや旧Service Role Keyをブラウザに出さない。
- ブラウザには `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` のみを使う。
- SupabaseのRLSを有効化する。
- 退職者・異動者のSupabase Authアカウントを停止する。
- 顧客共有前に `visibility=internal` が混入していないことを確認する。

## テスト

```powershell
npm.cmd test
npm.cmd run build
```

Supabase正本版の純粋関数テストとNext.jsのビルド確認を実行します。

## 主なファイル

- `app/page.jsx`: Supabase正本版の画面
- `src/domain.mjs`: 繰越、出力、要約生成などの純粋関数
- `src/supabaseClient.js`: Supabaseクライアント設定
- `supabase/schema.sql`: DBスキーマとRLS
- `docs/supabase-setup.md`: Supabase/Vercel設定手順
- `tests/domain.test.js`: Supabase正本版ロジックの軽量テスト

## 現時点の制約

- Stockへの自動投稿はしません。
- Stockタスクの自動作成はしません。
- Supabase Storageへのファイル保存はまだ使っていません。
- RLSは「認証済み職員は全顧客を扱える」事務所内共同利用モデルです。担当者別制限が必要な場合は追加設計します。
