export const STATUS_VALUES = ["open", "in_progress", "done", "on_hold", "withdrawn"];
export const VISIBILITY_VALUES = ["client", "internal"];
export const CATEGORY_VALUES = ["previous", "current", "next"];

export const statusLabels = {
  open: "未着手",
  in_progress: "対応中",
  done: "完了",
  on_hold: "保留",
  withdrawn: "取り下げ"
};

export const ownerLabels = {
  client: "顧客",
  office: "事務所",
  staff: "担当者"
};

export const categoryLabels = {
  previous: "過去について",
  current: "現在について",
  next: "未来について"
};

export const checklistItems = [
  ["meeting_result", "今回の面談結果を入力した"],
  ["status_updated", "未完了事項の状態を更新した"],
  ["carry_forward_checked", "次月以降へ繰り越す事項を確認した"],
  ["summary_generated", "共有用・内部用・Stock貼付用の出力を確認した"],
  ["task_registered", "期限付き宿題を必要に応じてタスク化した"]
];

export const baseCandidates = {
  previous: [
    ["過去実績の振り返り", "前月まで、前期、過年度などの実績推移や変化を人が確認して整理する。"],
    ["前回繰越事項の確認", "前回面談から持ち越した事項について、実行済み・途中・未着手を確認する。"],
    ["過去の決定事項・宿題の実施状況", "過去に決めた対応や宿題が実行されているか、止まっている場合は理由を確認する。"]
  ],
  current: [
    ["現在の資金繰り・納税予定の確認", "現在把握している資金繰り、納税予定、支払予定を人が確認して説明する。"],
    ["中間納税の納付額・納付時期の説明", "通知書や申告情報など確認済み資料に基づき、納付額と納付時期を説明する。"],
    ["現在の課題・相談事項", "顧客がいま困っていること、確認したいこと、判断材料が必要なことを整理する。"]
  ],
  next: [
    ["業績着地予測の確認", "今後の売上、利益、資金繰りの見通しを、根拠資料を見ながら確認する。"],
    ["短期経営計画の確認", "今後数か月の目標、行動、資金需要、優先順位を整理する。"],
    ["未来に向けた打ち手の整理", "採用、投資、借入、価格改定など、今後検討する打ち手を整理する。"]
  ]
};

export function normalizeTargetMonth(value) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}$/.test(text)) return "";
  const month = Number(text.slice(5, 7));
  return month >= 1 && month <= 12 ? text : "";
}

export function getPreviousTargetMonth(targetMonth) {
  const normalized = normalizeTargetMonth(targetMonth);
  if (!normalized) return "";
  const year = Number(normalized.slice(0, 4));
  const month = Number(normalized.slice(5, 7));
  const previous = new Date(Date.UTC(year, month - 2, 1));
  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatJapaneseMonth(targetMonth) {
  const normalized = normalizeTargetMonth(targetMonth);
  if (!normalized) return "対象月未設定";
  return `${normalized.slice(0, 4)}年${normalized.slice(5, 7)}月`;
}

export function isCarryForwardEligible(item) {
  return Boolean(item?.carry_forward ?? item?.carryForward)
    && !["done", "withdrawn"].includes(item?.status);
}

export function filterCarryForwardItems(items = []) {
  return items.filter(isCarryForwardEligible);
}

export function createAgendaItem(input = {}) {
  const status = STATUS_VALUES.includes(input.status) ? input.status : "open";
  const visibility = VISIBILITY_VALUES.includes(input.visibility) ? input.visibility : "client";
  const category = CATEGORY_VALUES.includes(input.category) ? input.category : "current";
  const carryForward = status === "done" || status === "withdrawn"
    ? false
    : input.carry_forward ?? input.carryForward ?? true;

  return {
    id: input.id || cryptoId(),
    meeting_id: input.meeting_id || input.meetingId || null,
    title: String(input.title || "").trim(),
    detail: String(input.detail || "").trim(),
    category,
    owner: String(input.owner || "").trim(),
    due_date: input.due_date || input.dueDate || null,
    status,
    carry_forward: Boolean(carryForward),
    visibility,
    source: input.source || "manual",
    source_item_id: input.source_item_id || input.sourceItemId || null,
    sort_order: Number.isFinite(Number(input.sort_order ?? input.sortOrder)) ? Number(input.sort_order ?? input.sortOrder) : 0
  };
}

export function updateItemStatus(item, status) {
  const nextStatus = STATUS_VALUES.includes(status) ? status : item.status;
  return {
    ...item,
    status: nextStatus,
    carry_forward: nextStatus === "done" || nextStatus === "withdrawn" ? false : Boolean(item.carry_forward)
  };
}

export function moveItemWithinCategory(items = [], itemId, direction) {
  const index = items.findIndex((item) => item.id === itemId);
  if (index < 0) return items;
  const category = items[index].category;
  const categoryIndexes = items
    .map((item, itemIndex) => ({ item, itemIndex }))
    .filter(({ item }) => item.category === category)
    .map(({ itemIndex }) => itemIndex);
  const categoryPosition = categoryIndexes.indexOf(index);
  const targetPosition = direction === "up" ? categoryPosition - 1 : categoryPosition + 1;
  if (targetPosition < 0 || targetPosition >= categoryIndexes.length) return items;
  const targetIndex = categoryIndexes[targetPosition];
  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next.map((item, sort_order) => ({ ...item, sort_order }));
}

export function groupItems(items = []) {
  return CATEGORY_VALUES.reduce((groups, category) => {
    groups[category] = items
      .filter((item) => (CATEGORY_VALUES.includes(item.category) ? item.category : "current") === category)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    return groups;
  }, {});
}

export function buildClientFacingItems(items = []) {
  return items.filter((item) => item.visibility === "client");
}

export function buildInternalItems(items = [], internalNotes = []) {
  return { items, internalNotes };
}

export function buildClientFacingOutput({ client = null, meeting = null, items = [] } = {}) {
  if (!meeting) return "";
  const groups = groupItems(buildClientFacingItems(items));
  return [
    `【${client?.name ? `${client.name} 様` : "月次面談アジェンダ"}】`,
    `${formatJapaneseMonth(meeting.target_month)}${meeting.meeting_date ? `　面談日：${meeting.meeting_date}` : ""}`,
    "",
    ...(meeting.meeting_aim ? ["■ 本日の重点テーマ", meeting.meeting_aim, ""] : []),
    "■ 本日のアジェンダ",
    ...CATEGORY_VALUES.flatMap((category) => [
      "",
      `■ ${categoryLabels[category]}`,
      ...(groups[category]?.length ? groups[category].map(agendaLine) : ["-"])
    ])
  ].join("\n");
}

export function buildInternalOutput({ client = null, meeting = null, items = [], internalNotes = [] } = {}) {
  if (!meeting) return "";
  const internal = buildInternalItems(items, internalNotes);
  return [
    `【${client?.name ? `${client.name} 様 ` : ""}${formatJapaneseMonth(meeting.target_month)} 内部用メモ】`,
    `面談日：${meeting.meeting_date || ""}`,
    `対象月：${meeting.target_month || ""}`,
    "",
    "■ アジェンダ",
    ...(internal.items.length ? internal.items.map(itemLine) : ["-"]),
    "",
    "■ 決定事項",
    meeting.decisions || "-",
    "",
    "■ 顧客側の宿題",
    meeting.client_homework || "-",
    "",
    "■ 事務所側の宿題",
    meeting.office_homework || "-",
    "",
    "■ 内部メモ",
    ...(internal.internalNotes.length ? internal.internalNotes.map((note) => `- ${note.title}${note.detail ? `: ${note.detail}` : ""}`) : ["-"])
  ].join("\n");
}

export function buildStockSummary(state) {
  const fileName = buildExportFileName(state.client_code || state.clientCode || "client", state.target_month || state.targetMonth || "YYYY-MM");
  const visibleItems = buildClientFacingItems(state.items || []);
  const internalItems = (state.items || []).filter((item) => item.visibility === "internal");
  const groups = groupItems(visibleItems);
  const carryForward = visibleItems.filter(isCarryForwardEligible);
  const clientHomework = visibleItems.filter((item) => item.owner === "client");
  const officeHomework = visibleItems.filter((item) => ["office", "staff"].includes(item.owner));
  const internalLines = [
    ...internalItems.map((item) => itemLine(item)),
    ...(state.internalNotes || []).map((note) => `- ${note.title}${note.detail ? `: ${note.detail}` : ""}`)
  ];

  return [
    `【${formatJapaneseMonth(state.target_month || state.targetMonth)} 巡回面談】`,
    `面談日：${state.meeting_date || state.meetingDate || ""}`,
    `担当：${state.staff_name || state.staffName || ""}`,
    `対象顧客コード：${state.client_code || state.clientCode || ""}`,
    `対象月：${state.target_month || state.targetMonth || ""}`,
    "保存先：Supabase",
    "",
    "■ 今回確認事項（過去・現在・未来）",
    ...categorizedLines(groups),
    "",
    "■ 決定事項",
    state.decisions || "-",
    "",
    "■ 次月以降繰越事項",
    ...listOrDash(carryForward.map(itemLine)),
    "",
    "■ 顧客側の宿題",
    ...listOrDash(clientHomework.map(itemLine)),
    "",
    "■ 事務所側の宿題",
    ...listOrDash(officeHomework.map(itemLine)),
    "",
    "■ 内部メモ",
    ...listOrDash(internalLines),
    "",
    "■ エクスポートJSON",
    fileName
  ].join("\n");
}

export function buildExportFileName(clientCode, targetMonth, version = 1) {
  const safeClient = String(clientCode || "client").replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeMonth = normalizeTargetMonth(targetMonth) || "YYYY-MM";
  return `junkai_${safeClient}_${safeMonth}_v${String(version).padStart(3, "0")}.json`;
}

export function buildExportJson(state) {
  const now = new Date().toISOString();
  const clientCode = state.client_code || state.clientCode || "";
  const targetMonth = state.target_month || state.targetMonth || "";
  return {
    schemaVersion: "2.0-supabase",
    sourceOfTruth: "supabase",
    clientCode,
    clientName: state.client_name || state.clientName || "",
    targetMonth,
    exportedAt: now,
    meeting: {
      id: state.id || "",
      meetingDate: state.meeting_date || state.meetingDate || "",
      staffName: state.staff_name || state.staffName || "",
      participants: state.participants || "",
      meetingAim: state.meeting_aim || state.meetingAim || "",
      decisions: state.decisions || "",
      clientHomework: state.client_homework || state.clientHomework || "",
      officeHomework: state.office_homework || state.officeHomework || ""
    },
    items: (state.items || []).map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      category: item.category,
      owner: item.owner,
      dueDate: item.due_date || item.dueDate || "",
      status: item.status,
      carryForward: Boolean(item.carry_forward ?? item.carryForward),
      visibility: item.visibility,
      source: item.source,
      sourceItemId: item.source_item_id || item.sourceItemId || ""
    })),
    internalNotes: state.internalNotes || [],
    generatedStockSummary: {
      text: state.stock_summary || state.stockSummary || "",
      generatedAt: state.stock_summary_generated_at || state.stockSummaryGeneratedAt || ""
    },
    exportInfo: {
      exportedFileName: buildExportFileName(clientCode, targetMonth),
      exportedAt: now
    }
  };
}

export function hasDueDatedOpenItems(items = []) {
  return items.some((item) => Boolean(item.due_date || item.dueDate) && !["done", "withdrawn"].includes(item.status));
}

export function getChecklistState(checklist = {}) {
  const unchecked = checklistItems.filter(([id]) => !checklist[id]);
  return { complete: unchecked.length === 0, uncheckedCount: unchecked.length };
}

export function toDbItem(item, meetingId, sortOrder = 0) {
  const normalized = createAgendaItem({ ...item, meeting_id: meetingId, sort_order: sortOrder });
  const { id, ...insertable } = normalized;
  return insertable;
}

export function itemLine(item) {
  const meta = [
    statusLabels[item.status] || item.status,
    item.owner ? `担当:${ownerLabels[item.owner] || item.owner}` : "",
    item.due_date || item.dueDate ? `期限:${item.due_date || item.dueDate}` : ""
  ].filter(Boolean).join(" / ");
  return `- ${item.title}${meta ? `（${meta}）` : ""}${item.detail ? `\n  ${item.detail}` : ""}`;
}

export function agendaLine(item) {
  return `- ${item.title}`;
}

function categorizedLines(groups) {
  const lines = [];
  CATEGORY_VALUES.forEach((category) => {
    const items = groups[category] || [];
    if (!items.length) return;
    lines.push(`- ${categoryLabels[category]}`);
    items.forEach((item) => lines.push(`  ${itemLine(item)}`));
  });
  return lines.length ? lines : ["-"];
}

function listOrDash(lines) {
  return lines.length ? lines : ["-"];
}

function cryptoId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
