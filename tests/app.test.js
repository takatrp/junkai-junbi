const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const rootDir = path.resolve(__dirname, "..");

function loadApi() {
  const source = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
  const context = { console };
  vm.createContext(context);
  vm.runInContext(`${source}
this.api = {
  validateAgendaJson,
  buildExportJson,
  buildExportFileName,
  parseTargetMonth,
  isValidTargetMonth,
  getPreviousMonth,
  getPreviousTargetMonth,
  isPreviousMonth,
  validateStartInput,
  canProceedWithPreviousJson,
  canProceedWithException,
  getCarryForwardItems,
  filterCarryForwardItems,
  isCarryForwardEligible,
  createNewItem,
  updateItemStatus,
  moveItemWithinCategory,
  buildClientFacingItems,
  buildInternalItems,
  buildClientFacingOutput,
  buildInternalOutput,
  buildStockSummary,
  formatJapaneseMonth,
  groupItemsForStockSummary,
  copyTextToClipboard,
  getStockSaveChecklistState,
  hasDueDatedOpenItems
};`, context);
  return context.api;
}

const api = loadApi();

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, "sample-data", fileName), "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("JSON検証: 正常・壊れたJSON・必須項目・不正値を検出できる", () => {
  const valid = readJson("sample_previous.json");
  assert.equal(api.validateAgendaJson(valid).valid, true);

  assert.throws(() => JSON.parse(fs.readFileSync(path.join(rootDir, "sample-data", "sample_broken_json.json"), "utf8")));

  const missingSchema = clone(valid);
  delete missingSchema.schemaVersion;
  assert.equal(api.validateAgendaJson(missingSchema).valid, false);

  const missingClient = clone(valid);
  missingClient.clientCode = "";
  assert.equal(api.validateAgendaJson(missingClient).valid, false);

  const badMonth = clone(valid);
  badMonth.targetMonth = "2026/05";
  assert.equal(api.validateAgendaJson(badMonth).valid, false);

  const badItems = clone(valid);
  badItems.items = {};
  assert.equal(api.validateAgendaJson(badItems).valid, false);

  const malformedItems = readJson("sample_malformed_items.json");
  const malformedResult = api.validateAgendaJson(malformedItems);
  assert.equal(malformedResult.valid, false);
  assert.ok(malformedResult.errors.some((error) => error.includes("status")));
  assert.ok(malformedResult.errors.some((error) => error.includes("visibility")));
});

test("月次判定: 前月判定と1月またぎを確認できる", () => {
  assert.equal(api.getPreviousTargetMonth("2026-06"), "2026-05");
  assert.equal(api.getPreviousTargetMonth("2026-01"), "2025-12");
  assert.equal(api.isPreviousMonth("2026-05", "2026-06"), true);
  assert.equal(api.isPreviousMonth("2025-12", "2026-01"), true);
  assert.equal(api.isPreviousMonth("2026-04", "2026-06"), false);
  assert.equal(api.isPreviousMonth("2026-06", "2026-06"), false);
  assert.equal(api.isValidTargetMonth("2026/06"), false);
  assert.equal(api.isValidTargetMonth("2026-13"), false);
});

test("開始ゲート: 前回JSON必須・顧客コード一致・前月以外理由・例外理由を確認できる", () => {
  const previous = readJson("sample_previous.json");
  assert.equal(api.canProceedWithPreviousJson({ clientCode: "TEST001", targetMonth: "2026-06", monthMismatchReason: "" }, null).ok, false);
  assert.equal(api.canProceedWithPreviousJson({ clientCode: "TEST001", targetMonth: "2026-06", monthMismatchReason: "" }, previous).ok, true);
  assert.equal(api.canProceedWithPreviousJson({ clientCode: "OTHER001", targetMonth: "2026-06", monthMismatchReason: "" }, previous).ok, false);

  const oldMonth = readJson("sample_old_month.json");
  const oldMonthWithoutReason = api.canProceedWithPreviousJson({ clientCode: "TEST001", targetMonth: "2026-06", monthMismatchReason: "" }, oldMonth);
  assert.equal(oldMonthWithoutReason.ok, false);
  assert.equal(oldMonthWithoutReason.requiresMonthMismatchReason, true);

  const oldMonthWithReason = api.canProceedWithPreviousJson({ clientCode: "TEST001", targetMonth: "2026-06", monthMismatchReason: "前回面談がないため。" }, oldMonth);
  assert.equal(oldMonthWithReason.ok, true);

  assert.equal(api.canProceedWithException("", "").ok, false);
  assert.equal(api.canProceedWithException("その他", "").ok, false);
  assert.equal(api.canProceedWithException("その他", "前回JSONがないため。").ok, true);
});

test("繰越ロジック: 未完了のみ繰越し、完了・取り下げ・繰越なしは対象外になる", () => {
  const previous = readJson("sample_previous.json");
  const carryIds = api.getCarryForwardItems(previous).map((item) => item.id).sort();
  assert.deepEqual(carryIds, ["item-001", "item-002", "item-006"]);

  const completed = readJson("sample_completed_items.json");
  const completedCarryIds = api.filterCarryForwardItems(completed.items).map((item) => item.id);
  assert.deepEqual(completedCarryIds, ["completed-item-004"]);

  const updatedDone = api.updateItemStatus("item-001", "done", api.getCarryForwardItems(previous));
  const doneItem = updatedDone.find((item) => item.id === "item-001");
  assert.equal(doneItem.status, "done");
  assert.equal(doneItem.carryForward, false);

  const updatedWithdrawn = api.updateItemStatus("item-006", "withdrawn", api.getCarryForwardItems(previous));
  const withdrawnItem = updatedWithdrawn.find((item) => item.id === "item-006");
  assert.equal(withdrawnItem.status, "withdrawn");
  assert.equal(withdrawnItem.carryForward, false);
});

test("アジェンダ並び替え: 同じカテゴリ内で上下移動できる", () => {
  const items = [
    api.createNewItem({ id: "past-001", title: "過去1", category: "previous" }),
    api.createNewItem({ id: "current-001", title: "現在1", category: "current" }),
    api.createNewItem({ id: "past-002", title: "過去2", category: "previous" }),
    api.createNewItem({ id: "past-003", title: "過去3", category: "previous" })
  ];

  const movedUp = api.moveItemWithinCategory(items, "past-003", "up");
  assert.deepEqual(Array.from(movedUp, (item) => item.id), ["past-001", "current-001", "past-003", "past-002"]);

  const topUnchanged = api.moveItemWithinCategory(movedUp, "past-001", "up");
  assert.deepEqual(Array.from(topUnchanged, (item) => item.id), ["past-001", "current-001", "past-003", "past-002"]);

  const currentUnchanged = api.moveItemWithinCategory(items, "current-001", "down");
  assert.deepEqual(Array.from(currentUnchanged, (item) => item.id), ["past-001", "current-001", "past-002", "past-003"]);
});

test("visibility分離: internal項目は顧客共有用に出さず、内部用とStock要約では内部欄に分ける", () => {
  const visibilitySample = readJson("sample_internal_visibility.json");
  const items = api.getCarryForwardItems(visibilitySample);

  const clientOutput = api.buildClientFacingOutput({ items });
  assert.equal(clientOutput.items.some((item) => item.visibility === "internal"), false);
  assert.equal(clientOutput.items.some((item) => item.id === "visibility-item-001"), true);
  assert.equal(clientOutput.items.some((item) => item.id === "visibility-item-002"), false);

  const internalOutput = api.buildInternalOutput({ items, internalNotes: visibilitySample.internalNotes });
  assert.equal(internalOutput.items.some((item) => item.id === "visibility-item-002"), true);
  assert.equal(internalOutput.internalNotes.length, 1);

  const summary = api.buildStockSummary({
    clientCode: "TESTVIS",
    targetMonth: "2026-06",
    meetingDate: "2026-06-07",
    staffName: "サンプル担当者",
    decisions: "確認した。",
    clientHomework: "",
    officeHomework: "",
    internalNotes: visibilitySample.internalNotes,
    items,
    startInfo: { startMode: "previous_json" }
  });
  const confirmationSection = summary.split("■ 決定事項")[0];
  const internalSection = summary.split("■ 内部メモ")[1];
  assert.equal(confirmationSection.includes("内部だけの確認事項"), false);
  assert.equal(internalSection.includes("内部だけの確認事項"), true);
  assert.equal(internalSection.includes("内部メモ確認"), true);
});

test("Stock貼付用要約とJSON出力: 必要項目・ファイル名・再読込可能性を確認できる", () => {
  const previous = readJson("sample_previous.json");
  const items = api.getCarryForwardItems(previous);
  const state = {
    clientCode: "TEST001",
    clientName: "",
    targetMonth: "2026-06",
    meetingDate: "2026-06-07",
    staffName: "サンプル担当者",
    participants: "",
    meetingAim: "面談要約確認",
    decisions: "次回までに資料を確認する。",
    clientHomework: "顧客側の手入力宿題。",
    officeHomework: "事務所側の手入力宿題。",
    internalNotes: [{ id: "note-test", title: "内部確認メモ", detail: "次回前に確認する。", visibility: "internal" }],
    items,
    startInfo: { startMode: "previous_json", importedPreviousFileName: "sample_previous.json" },
    generatedStockSummary: { text: "", generatedAt: "" }
  };

  const summary = api.buildStockSummary(state);
  assert.ok(summary.includes("【2026年06月 巡回面談】"));
  assert.ok(summary.includes("面談日：2026-06-07"));
  assert.ok(summary.includes("担当：サンプル担当者"));
  assert.ok(summary.includes("対象顧客コード：TEST001"));
  assert.ok(summary.includes("■ 今回確認事項（過去・現在・未来）"));
  assert.ok(summary.includes("- 過去について"));
  assert.ok(summary.includes("■ 決定事項"));
  assert.ok(summary.includes("■ 次回繰越事項"));
  assert.ok(summary.includes("■ 顧客側の宿題"));
  assert.ok(summary.includes("■ 事務所側の宿題"));
  assert.ok(summary.includes("■ 内部メモ"));
  assert.ok(summary.includes("junkai_TEST001_2026-06_v001.json"));

  const payload = api.buildExportJson({
    ...state,
    generatedStockSummary: { text: summary, generatedAt: "2026-06-07T00:00:00+09:00" }
  });
  assert.equal(payload.exportInfo.exportedFileName, api.buildExportFileName("TEST001", "2026-06", 1));
  assert.equal(api.validateAgendaJson(payload).valid, true);
});

test("面談後チェックリスト: 未完了と完了、期限付き未完了項目を確認できる", () => {
  const completeChecks = {
    meeting_result: true,
    status_updated: true,
    carry_forward_checked: true,
    json_exported: true,
    summary_pasted: true,
    json_attached: true,
    stock_tasks_registered: true
  };
  const incompleteChecks = { ...completeChecks, json_attached: false };
  assert.equal(api.getStockSaveChecklistState(incompleteChecks).complete, false);
  assert.equal(api.getStockSaveChecklistState(incompleteChecks).uncheckedCount, 1);
  assert.equal(api.getStockSaveChecklistState(completeChecks).complete, true);

  assert.equal(api.hasDueDatedOpenItems([
    api.createNewItem({ title: "期限付き未完了", dueDate: "2026-06-30", status: "open" })
  ]), true);
  assert.equal(api.hasDueDatedOpenItems([
    api.createNewItem({ title: "期限付き完了", dueDate: "2026-06-30", status: "done" })
  ]), false);
});

test("クリップボードコピー: Clipboard APIがない環境では失敗扱いにして手動コピーに委ねる", async () => {
  assert.equal(await api.copyTextToClipboard("copy target"), false);
});
