const assert = require("node:assert/strict");
const test = require("node:test");

test("Supabase正本ドメイン: 前月判定と1月またぎを確認できる", async () => {
  const domain = await import("../src/domain.mjs");
  assert.equal(domain.getPreviousTargetMonth("2026-06"), "2026-05");
  assert.equal(domain.getPreviousTargetMonth("2026-01"), "2025-12");
  assert.equal(domain.getPreviousTargetMonth("2026/06"), "");
});

test("Supabase正本ドメイン: 繰越対象は未完了かつcarry_forward=trueだけになる", async () => {
  const domain = await import("../src/domain.mjs");
  const items = [
    domain.createAgendaItem({ id: "a", title: "未着手", status: "open", carry_forward: true }),
    domain.createAgendaItem({ id: "b", title: "対応中", status: "in_progress", carry_forward: true }),
    domain.createAgendaItem({ id: "c", title: "保留", status: "on_hold", carry_forward: true }),
    domain.createAgendaItem({ id: "d", title: "完了", status: "done", carry_forward: true }),
    domain.createAgendaItem({ id: "e", title: "取下げ", status: "withdrawn", carry_forward: true }),
    domain.createAgendaItem({ id: "f", title: "繰越なし", status: "open", carry_forward: false })
  ];
  assert.deepEqual(domain.filterCarryForwardItems(items).map((item) => item.id), ["a", "b", "c"]);
});

test("Supabase正本ドメイン: internal項目はStock要約の内部メモ欄に分離される", async () => {
  const domain = await import("../src/domain.mjs");
  const summary = domain.buildStockSummary({
    client_code: "TEST001",
    target_month: "2026-06",
    meeting_date: "2026-06-18",
    staff_name: "サンプル担当者",
    decisions: "決定事項",
    items: [
      domain.createAgendaItem({ id: "client", title: "顧客共有項目", visibility: "client", category: "current" }),
      domain.createAgendaItem({ id: "internal", title: "内部だけの項目", visibility: "internal", category: "current" })
    ],
    internalNotes: [{ title: "内部メモ", detail: "内部確認" }]
  });

  const confirmationSection = summary.split("■ 決定事項")[0];
  const internalSection = summary.split("■ 内部メモ")[1];
  assert.equal(confirmationSection.includes("内部だけの項目"), false);
  assert.equal(internalSection.includes("内部だけの項目"), true);
  assert.equal(internalSection.includes("内部メモ"), true);
});

test("Supabase正本ドメイン: 顧客共有用出力にinternal項目と内部メモを混ぜない", async () => {
  const domain = await import("../src/domain.mjs");
  const state = {
    client: { code: "TEST001", name: "サンプル株式会社" },
    meeting: { target_month: "2026-06", meeting_date: "2026-06-18", meeting_aim: "確認テーマ" },
    items: [
      domain.createAgendaItem({ id: "client", title: "顧客共有項目", visibility: "client", category: "current" }),
      domain.createAgendaItem({ id: "internal", title: "内部だけの項目", visibility: "internal", category: "current" })
    ],
    internalNotes: [{ title: "内部メモ", detail: "顧客には出さない" }]
  };

  const clientOutput = domain.buildClientFacingOutput(state);
  const internalOutput = domain.buildInternalOutput(state);
  assert.equal(clientOutput.includes("顧客共有項目"), true);
  assert.equal(clientOutput.includes("内部だけの項目"), false);
  assert.equal(clientOutput.includes("内部メモ"), false);
  assert.equal(internalOutput.includes("内部だけの項目"), true);
  assert.equal(internalOutput.includes("内部メモ"), true);
});

test("Supabase正本ドメイン: 顧客共有用アジェンダは見出しだけを出す", async () => {
  const domain = await import("../src/domain.mjs");
  const output = domain.buildClientFacingOutput({
    client: { code: "TEST001", name: "サンプル株式会社" },
    meeting: { target_month: "2026-06", meeting_date: "2026-06-18", meeting_aim: "資金繰り確認" },
    items: [
      domain.createAgendaItem({
        id: "agenda-001",
        title: "中間納税の確認",
        detail: "納付額と納付時期を確認する。",
        owner: "client",
        due_date: "2026-06-30",
        status: "in_progress",
        visibility: "client",
        category: "current"
      })
    ]
  });

  assert.equal(output.includes("中間納税の確認"), true);
  assert.equal(output.includes("納付額と納付時期を確認する。"), false);
  assert.equal(output.includes("担当:"), false);
  assert.equal(output.includes("期限:"), false);
  assert.equal(output.includes("対応中"), false);
});

test("Supabase正本ドメイン: JSON出力はsourceOfTruth=supabaseを持つ", async () => {
  const domain = await import("../src/domain.mjs");
  const payload = domain.buildExportJson({
    id: "meeting-001",
    client_code: "TEST001",
    client_name: "サンプル株式会社",
    target_month: "2026-06",
    meeting_date: "2026-06-18",
    items: [domain.createAgendaItem({ id: "item-001", title: "確認事項" })],
    internalNotes: []
  });
  assert.equal(payload.schemaVersion, "2.0-supabase");
  assert.equal(payload.sourceOfTruth, "supabase");
  assert.equal(payload.exportInfo.exportedFileName, "junkai_TEST001_2026-06_v001.json");
});
