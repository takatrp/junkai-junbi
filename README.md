# junkai-junbi

Stockを正本とする月次面談アジェンダ管理ツールです。

このツールはStockの代替ではありません。月次面談前にアジェンダを整え、面談後にStockノートへ残す本文の下書きや、Stockノートへ添付するJSONを作るための静的HTMLツールです。

## 位置づけ

- 正本データはStockノート本文と、Stockノートに添付するJSONファイルです。
- localStorageは正本ではありません。このツールは顧客データや面談メモをlocalStorageへ保存しません。
- このリポジトリ内に顧客データを保存しません。
- Stock API連携、Stock画面のスクレイピング、自動ログインは行いません。
- 外部通信、バックエンド、クラウドDBは追加しません。
- TKCの巡回監査機能は再実装しません。
- 所長指示PDF表示、CSV読込、異常値検出、税務判断自動化に見える機能は扱いません。

## 使い方

`index.html` をブラウザで開いて使用します。サーバーやデータベースは不要です。

## Stock運用フロー

1. Stockで対象顧客の月次面談ノートを開く。
2. 顧客コードと今回の対象月を入力する。
3. 通常ルートでは、前回ノートに添付されたJSONを読み込んで開始する。
4. 前回JSONがない場合は、例外理由と理由詳細を入力して例外開始する。
5. 前回JSONの未完了・繰越対象事項が、今回アジェンダの「過去について」に自動表示される。
6. 今回の面談日、担当者、アジェンダ項目、各項目の状態・次月以降繰越・公開範囲を入力する。
7. 顧客共有用アジェンダと内部用メモを作成し、必要に応じてコピーまたは印刷する。
8. 面談後、決定事項・宿題・内部メモを入力する。
9. Stock貼付用要約を生成し、人間が読める面談記録としてStockノート本文へ貼り付ける。
10. 今回JSONを出力し、Stockノートへ添付する。
11. 期限付きの宿題はStockタスクへ手動で登録する。

## 現在の主な機能

- 月次面談の基本情報入力
- 前回JSONの読込と検証
- 前回JSON必須の通常開始
- 理由入力必須の例外開始
- 前回JSONからの未完了事項の自動繰越
- 過去について・現在について・未来についての3軸でのアジェンダ整理
- 項目ごとの状態、次回繰越、公開範囲の編集
- アジェンダ候補の選択
- アジェンダ項目の手動追加
- 顧客共有用アジェンダの生成・コピー・印刷
- 内部用メモの生成・コピー・印刷
- Stock貼付用要約の生成・コピー
- 面談結果を含むJSONの出力
- 面談後のStock保存チェックリスト

## 職員向け運用手順

通常開始では、必ず前回のStockノートに添付されたJSONをダウンロードし、このツールへ読み込ませてから開始します。前回JSONを読み込まないまま通常フローへ進めない設計です。

前回JSONがない場合だけ、例外開始を使います。例外開始では、初回作成、新規関与、前回面談なし、データ移行前、その他の理由を選び、理由詳細を入力します。例外開始を使った理由は今回JSONに残します。

面談後は、次の順番でStockへ戻します。

1. 面談結果、決定事項、宿題、内部メモを入力する。
2. 未完了事項の状態と次回繰越設定を確認する。
3. Stock貼付用要約を生成する。
4. 今回JSONを出力する。
5. Stockノート本文へStock貼付用要約を貼り付ける。
6. Stockノートへ今回JSONを添付する。
7. 期限付き宿題がある場合はStockタスクへ手動登録する。
8. 面談後チェックリストをすべて確認する。

Stock上の顧客ノートには、必ず人間が読める要約本文と、次回読込用のJSON添付の両方を残します。JSONだけを職員PCに保存したままにしないでください。

顧客共有用出力と内部用出力は用途が異なります。

- 顧客共有用出力: `visibility=client` の項目だけを表示します。
- 内部用出力: `visibility=client` と `visibility=internal` の両方を表示します。
- Stock貼付用要約: Stock本文に残す面談記録です。内部メモや内部向け項目は内部メモ欄として区分します。

## アジェンダの時間軸

アジェンダは「前回の話・今回の話・次回の話」ではなく、「過去について・現在について・未来について」の3軸で整理します。

- 過去について: 過去実績、前回JSONからの繰越、過去の決定事項や宿題の実施状況。
- 現在について: 現在の資金繰り、納付予定、中間納税の納付額・納付時期、現在の課題や相談事項。
- 未来について: 業績着地予測、短期経営計画、今後の打ち手、次月以降へ繰り越す宿題。

前回JSONから自動繰越される未完了事項は、「過去について」に表示します。これは前回面談の話に限定するためではなく、過去から残っている論点として扱うためです。

## 繰越と公開範囲

前回JSONから今回アジェンダへ自動表示されるのは、次の条件をすべて満たす項目です。

- `carryForward` が `true`
- `status` が `done` ではない
- `status` が `withdrawn` ではない

`open`, `in_progress`, `on_hold` は、`carryForward=true` であれば繰越対象です。今回画面で `done` または `withdrawn` にした項目はJSONには残りますが、次回読込時の自動繰越対象にはなりません。

公開範囲は次のように扱います。

- `visibility=client`: 顧客共有用出力と内部用出力の両方に表示
- `visibility=internal`: 内部用出力にのみ表示
- `internalNotes`: 内部用出力にのみ表示し、顧客共有用出力には表示しない

## Stock貼付用要約

Stock貼付用要約は、Stockノート本文へ貼り付けるためのプレーンテキストです。顧客共有用アジェンダとは別物として扱い、内部メモや内部向け項目は「内部メモ」セクションに区分します。

要約には次の内容を含めます。

- 対象月、面談日、担当者、対象顧客コード
- 開始方法。例外開始の場合は例外理由
- 今回確認事項（過去・現在・未来）
- 決定事項
- 次回繰越事項
- 顧客側の宿題
- 事務所側の宿題
- 内部メモ
- 添付JSONファイル名

添付JSONファイル名は、JSON出力時と同じ `junkai_{clientCode}_{targetMonth}_v001.json` の形式で生成します。

## 面談後チェックリスト

面談結果タブには、Stock保存フローのチェックリストを表示します。すべてチェックされるまで完了扱いにはならず、「未完了の手順があります」と表示されます。すべてチェックすると「Stock保存フロー完了」と表示されます。

期限付きの未完了項目がある場合は、「期限付き宿題をStockタスクに登録した」のチェック項目を強調します。これはStockタスク登録の見落としを防ぐための表示であり、Stockへの自動登録は行いません。

## 運用前確認

このツールはTKCの代替ではなく、Stockの代替でもありません。Stock添付JSONを正本とし、面談後はStock本文へ要約を貼り、今回JSONをStockノートへ添付します。

運用前には次を確認します。

- 前回JSONを読み込んでからアジェンダ作成する。
- 例外開始は前回JSONがない場合だけ使い、理由を残す。
- 顧客共有用出力には内部メモや `visibility=internal` の項目を含めない。
- Stock貼付用要約と今回JSONの両方をStockに残す。
- 期限付き宿題は必要に応じてStockタスクへ手動登録する。
- localStorageを正本扱いしない。

軽量テストはNode.js標準の `node:test` で実行できます。外部ライブラリは不要です。

```powershell
node --test tests\app.test.js
```

## JSON仕様の概要

Stockノートに添付するJSONは、次の構造を基本にします。不明な追加フィールドは、後続PRで利用できる余地を残すため、検証時にむやみに削除しません。

必須の主な項目:

- `schemaVersion`: JSON仕様のバージョン
- `clientCode`: 顧客コード
- `clientName`: 顧客名。空欄でも運用可能
- `targetMonth`: 対象月。`YYYY-MM` 形式
- `createdAt`: JSON作成日時
- `createdBy`: JSON作成者
- `meeting`: 面談日、担当者、要約などの面談情報
- `startInfo`: 前回JSON開始または例外開始の記録
- `items`: アジェンダ・宿題・繰越候補の配列
- `internalNotes`: 内部メモの配列
- `generatedStockSummary`: Stock貼付用要約。生成済みの場合に本文と生成日時を保存
- `exportInfo`: 出力ファイル名、出力日時など

`items` の検証ルール:

- 各項目に `id`, `title`, `status`, `carryForward`, `visibility` が必要
- `status` は `open`, `in_progress`, `done`, `on_hold`, `withdrawn` のいずれか
- `carryForward` は `true` または `false`
- `visibility` は `client` または `internal`

開始情報 `startInfo`:

- `startMode`: `previous_json` または `exception`
- `exceptionReason`: 例外開始時の理由
- `exceptionDetail`: 例外開始時の理由詳細
- `monthMismatchReason`: 前月以外のJSONで通常開始した理由
- `importedPreviousFileName`: 読み込んだ前回JSONファイル名
- `importedPreviousTargetMonth`: 読み込んだ前回JSONの対象月
- `expectedPreviousTargetMonth`: 今回対象月から計算した本来の前月

出力ファイル名:

```text
junkai_{clientCode}_{targetMonth}_v001.json
```

サンプルJSON:

- `sample-data/sample_previous.json`: 読込成功と繰越条件確認用
- `sample-data/sample_invalid_client_code.json`: `clientCode` 不備のエラー確認用
- `sample-data/sample_old_month.json`: 前月以外JSONの警告確認用
- `sample-data/sample_january_previous_month.json`: 1月対象月で前年12月を前月として扱う確認用
- `sample-data/sample_completed_items.json`: `done`, `withdrawn`, `carryForward=false`, `on_hold` の繰越条件確認用
- `sample-data/sample_internal_visibility.json`: 顧客共有用と内部用の分離確認用
- `sample-data/sample_malformed_items.json`: 不正な `status` と `visibility` の検証確認用
- `sample-data/sample_broken_json.json`: JSONとして壊れたファイルのエラー確認用

## 第1PRで削除した方針

このリポジトリは、TKC機能の代替や自動判定ツールではなく、Stockに残す面談記録を整える補助ツールとして再設計します。

削除対象は次のとおりです。

- 所長指示PDF表示
- CSV読込
- 月次データからの自動アラート
- 異常値検出
- 税務判断自動化に見える処理
- CSV由来の月次レポート生成

## 禁止事項

- 顧客データをGitHubリポジトリへ置かない。
- JSONを職員PCだけに保存したままにしない。
- `visibility=internal` の項目や `internalNotes` を顧客へ共有しない。
- Stock API連携、自動ログイン、Stock画面のスクレイピングを試みない。
- 外部サーバー送信、バックエンド追加、クラウドDB追加を行わない。

## 詳細ドキュメント

- `docs/user-manual.md`: 職員向け操作マニュアル
- `docs/operation-flow.md`: 巡回前、面談中、面談後の運用フロー
- `docs/manual-test-checklist.md`: ブラウザで確認する手動テスト手順
