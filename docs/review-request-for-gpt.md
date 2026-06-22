# GPTレビュー依頼書

この文書は、月次面談アジェンダ管理ツールをGPTなどの外部レビュー用AIに確認してもらうための共有資料です。
実在顧客データ、Supabaseの秘密情報、`.env.local` は含めずに渡してください。

## レビュー対象

- プロジェクト名: `junkai-junbi`
- 種別: Next.js / Supabase アプリ
- レビュー用公開URL: `https://takatrp.github.io/junkai-junbi/`
- 目的: Supabase Postgresを正本とする月次面談アジェンダ管理
- 主な利用者: 事務所職員
- 主な出力:
  - 顧客共有用アジェンダ
  - 内部用メモ
  - Stock貼付用要約
  - JSONエクスポート

## 基本方針

- 正本データはSupabase Postgresに置く。
- Stockは正本ではなく、必要に応じて要約文を貼り付ける控えとして使う。
- Stock API連携、Stock自動ログイン、Stock画面スクレイピングは行わない。
- TKCの巡回監査機能、税務判断自動化、CSV異常値検出は実装しない。
- 顧客データ、面談メモ、繰越事項をGitHubリポジトリに保存しない。
- `localStorage` を正本として使わない。
- ブラウザ側にSupabase service role keyやsecret keyを出さない。
- `visibility=internal` の項目と `internal_notes` は顧客共有用アジェンダに出さない。

## 現在の実装概要

- Supabase Authで職員がログインする。
- 顧客を登録し、対象月ごとに面談データを作成する。
- 前月の未完了かつ繰越対象の項目を、対象月作成時に自動で繰り越す。
- アジェンダは「過去について」「現在について」「未来について」の3カテゴリで整理する。
- 顧客共有用アジェンダは、印刷して渡せるシンプルな見た目にしている。
- 内部用メモとStock貼付用要約は、顧客共有用アジェンダとは別出力として扱う。
- 面談後チェックリストで保存・出力漏れを確認する。

## 繰越ルール

次の条件をすべて満たす項目だけを次月作成時に自動繰越する。

- `carry_forward` が `true`
- `status` が `done` ではない
- `status` が `withdrawn` ではない

繰越対象になる状態:

- `open`
- `in_progress`
- `on_hold`

繰越対象外になる状態:

- `done`
- `withdrawn`
- `carry_forward=false`

## visibilityルール

- `visibility=client`: 顧客共有用アジェンダに表示してよい。
- `visibility=internal`: 顧客共有用アジェンダに表示してはいけない。
- 内部用メモには `client` と `internal` の両方を表示してよい。
- `internal_notes` は顧客共有用アジェンダに表示してはいけない。
- Stock貼付用要約では、内部項目は内部メモ欄に明確に分ける。

## 主な確認ファイル

レビュー時は、主に以下を確認してください。

- `README.md`
- `AGENTS.md`
- `docs/operation-flow.md`
- `docs/manual-test-checklist.md`
- `docs/user-manual.md`
- `app/page.jsx`
- `app/layout.jsx`
- `app/globals.css`
- `src/domain.mjs`
- `src/supabaseClient.js`
- `supabase/schema.sql`
- `tests/domain.test.js`
- `package.json`

## 渡してはいけないもの

外部レビューやAIレビューに渡すZIP、スクリーンショット、貼付テキストには以下を含めないでください。

- `.env.local`
- Supabase service role key
- Supabase secret key
- 実在顧客名
- 実在法人名
- 実在事務所の内部資料
- 実際の面談メモ
- 個人メールアドレスが写ったログイン画面
- `node_modules/`
- `.next/`
- ビルド成果物

## 既知の制約

- 現時点のRLSは、認証済み職員が全顧客データを扱える事務所内共同利用モデルである。
- 職員ごと、顧客ごとの細かい権限制御は未実装である。
- Stockへの投稿、Stockタスク作成、Stock添付は自動化しない。
- Supabase Storageによるファイル保存は現時点では使っていない。
- JSONエクスポートは控え・移行・バックアップ用途であり、正本ではない。
- 顧客共有用アジェンダは意図的に詳細欄を出さず、見出し中心にしている。

## レビューで特に見てほしい点

1. Supabase Auth / RLS / SQL設計に重大なセキュリティ問題がないか。
2. ブラウザ側に秘密キーや危険な権限が露出していないか。
3. `visibility=internal` や `internal_notes` が顧客共有用アジェンダ、印刷、コピーに混入しないか。
4. 前月からの繰越ロジックが正しいか。
5. `done` / `withdrawn` / `carry_forward=false` の項目が次月に復活しないか。
6. 1月をまたぐ前月判定など、月次ロジックに問題がないか。
7. 顧客共有用アジェンダの印刷デザインが業務利用に耐えるか。
8. 面談後チェックリストが保存漏れ防止として有効か。
9. テストで不足している観点は何か。
10. 本番運用前に必ず直すべき点は何か。

## GPTに貼る依頼文

以下をGPTに貼り付け、上記ファイル一式またはGitHubの対象ブランチを渡してください。

```text
あなたは上級プロダクトエンジニア兼セキュリティレビュアーです。
Next.js / Supabaseで作られた「月次面談アジェンダ管理ツール」をレビューしてください。

このツールの目的は、Supabase Postgresを正本として、顧客との月次面談アジェンダ、繰越事項、内部メモ、Stock貼付用要約を管理することです。

重要方針:
- Supabaseを正本とする
- Stockは正本ではなく、必要に応じて要約文を貼る控えとして使う
- Stock API連携、Stock自動ログイン、Stock画面スクレイピングはしない
- TKC代替、税務判断自動化、CSV異常値検出はしない
- 実在顧客データをGitHubに置かない
- localStorageを正本にしない
- internal項目を顧客共有用アジェンダに混ぜない
- 前月の未完了繰越事項が確実に表示されることを最優先する

レビュー観点:
1. Supabase Auth / RLS / schema.sql に重大なセキュリティ問題がないか
2. 顧客データや内部メモが意図せず顧客向け画面・印刷・出力に混入しないか
3. 前月からの繰越ロジックに抜け漏れがないか
4. done / withdrawn / carry_forward=false の扱いが正しいか
5. 顧客共有用アジェンダの印刷に不要な内部情報が出ないか
6. UIが実務で迷いにくいか
7. テストで不足している観点
8. 本番運用前に修正すべき点

出力形式:
- 重大度 Critical / High / Medium / Low
- 該当ファイルと該当箇所
- 問題の内容
- 実務上のリスク
- 修正案
- 追加すべきテスト

なお、実在データ、Supabaseの秘密キー、.env.local はレビュー資料に含めていません。
```

## レビュー資料の作り方

GitHubでレビューさせる場合:

1. 対象ブランチまたはPull RequestのURLを用意する。
2. この文書の「GPTに貼る依頼文」を貼る。
3. レビュー対象として、`README.md`、`AGENTS.md`、`docs/`、`app/`、`src/`、`supabase/schema.sql`、`tests/` を見るように指示する。

ZIPで渡す場合:

1. 以下だけを含める。
   - `README.md`
   - `AGENTS.md`
   - `docs/`
   - `app/`
   - `src/`
   - `supabase/schema.sql`
   - `tests/`
   - `package.json`
   - `.env.example`
2. 以下は必ず除外する。
   - `.env.local`
   - `node_modules/`
   - `.next/`
   - 実データ
   - 秘密キー

## 人間側で先に確認すること

- レビュー資料に `.env.local` が入っていないこと。
- スクリーンショットにメールアドレスや実在顧客名が写っていないこと。
- Supabaseのservice role keyを貼っていないこと。
- 実在の面談メモ、内部メモ、顧客情報を含めていないこと。
- 顧客共有用アジェンダにinternal項目が混ざらないことを、手元で一度確認していること。
