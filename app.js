const SCHEMA_VERSION = "1.0";
const EXPORT_VERSION = 1;
const VALID_STATUSES = ["open", "in_progress", "done", "on_hold", "withdrawn"];
const VALID_VISIBILITIES = ["client", "internal"];
const EXCEPTION_REASONS = ["初回作成", "新規関与", "前回面談なし", "データ移行前", "その他"];
const CLOSED_STATUSES = ["done", "withdrawn"];
const STOCK_SAVE_CHECKLIST = [
  { id: "meeting_result", label: "今回の面談結果を入力した", orderLabel: "面談結果を入力" },
  { id: "status_updated", label: "未完了事項の状態を更新した", orderLabel: "状態を更新" },
  { id: "carry_forward_checked", label: "次回繰越事項を確認した", orderLabel: "次回繰越事項を確認" },
  { id: "json_exported", label: "今回JSONを出力した", orderLabel: "今回JSONを出力" },
  { id: "summary_pasted", label: "Stock貼付用要約をStockノート本文へ貼り付けた", orderLabel: "Stock本文へ要約を貼る" },
  { id: "json_attached", label: "今回JSONをStockノートへ添付した", orderLabel: "StockへJSONを添付" },
  { id: "stock_tasks_registered", label: "期限付き宿題をStockタスクに登録した", orderLabel: "必要な宿題をStockタスク化" }
];

const statusLabels = {
  open: "未着手",
  in_progress: "対応中",
  done: "完了",
  on_hold: "保留",
  withdrawn: "取り下げ"
};

const visibilityLabels = {
  client: "顧客共有",
  internal: "内部のみ"
};

const ownerLabels = {
  "": "未設定",
  client: "顧客",
  office: "事務所",
  staff: "事務所"
};

const categoryLabels = {
  previous: "過去について",
  current: "現在について",
  next: "未来について"
};

const categoryEntryDescriptions = {
  previous: "過去実績、前回繰越、過去の決定事項や宿題の実施状況に関する事項を追加します。",
  current: "現在の資金繰り、納付予定、中間納税、相談事項に関する事項を追加します。",
  next: "業績着地予測、短期経営計画、今後の打ち手や期限付き宿題に関する事項を追加します。"
};

const baseCandidates = {
  previous: [
    candidate("過去実績の振り返り", "前月まで、前期、過年度などの実績推移や変化を人が確認して整理する。", "基本テーマ"),
    candidate("前回繰越事項の確認", "前回面談から持ち越した事項について、実行済み・途中・未着手を確認する。", "基本テーマ"),
    candidate("過去の決定事項・宿題の実施状況", "過去に決めた対応や宿題が実行されているか、止まっている場合は理由を確認する。", "基本テーマ")
  ],
  current: [
    candidate("現在の資金繰り・納税予定の確認", "現在把握している資金繰り、納税予定、支払予定を人が確認して説明する。", "基本テーマ"),
    candidate("中間納税の納付額・納付時期の説明", "通知書や申告情報など確認済み資料に基づき、納付額と納付時期を説明する。", "基本テーマ"),
    candidate("現在の課題・相談事項", "顧客がいま困っていること、確認したいこと、判断材料が必要なことを整理する。", "基本テーマ")
  ],
  next: [
    candidate("業績着地予測の確認", "今後の売上、利益、資金繰りの見通しを、根拠資料を見ながら確認する。", "基本テーマ"),
    candidate("短期経営計画の確認", "今後数か月の目標、行動、資金需要、優先順位を整理する。", "基本テーマ"),
    candidate("未来に向けた打ち手の整理", "採用、投資、借入、価格改定など、今後検討する打ち手を整理する。", "基本テーマ")
  ]
};

const formIds = [
  "clientCode",
  "clientName",
  "targetMonth",
  "meetingDate",
  "staffName",
  "participants",
  "meetingAim",
  "previousManual",
  "currentManual",
  "nextManual",
  "decisions",
  "clientHomework",
  "officeHomework",
  "monthMismatchReason",
  "exceptionReason",
  "exceptionDetail",
  "newInternalNoteTitle",
  "newInternalNoteDetail"
];

let state = {
  items: createInitialAgendaItems(),
  internalNotes: [],
  start: emptyStartState(),
  previousJson: null,
  previousJsonValidation: emptyPreviousJsonValidation(),
  stockSummaryText: "",
  stockSummaryGeneratedAt: "",
  stockSummaryMessage: "",
  stockSaveChecklist: emptyStockSaveChecklist(),
  lastExportedFileName: "",
  exportMessage: ""
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function candidate(title, detail, source, options = {}) {
  return {
    id: options.id || uniqueId("item"),
    title,
    detail,
    source,
    custom: Boolean(options.custom)
  };
}

function createInitialAgendaItems(carryForwardItems = []) {
  const templateItems = Object.keys(categoryLabels).flatMap((category) => (
    baseCandidates[category].map((item) => createNewItem({
      id: item.id,
      title: item.title,
      detail: item.detail,
      owner: "",
      dueDate: "",
      status: "open",
      carryForward: category !== "current",
      visibility: "client",
      source: "template",
      sourceLabel: item.source,
      category,
      selected: false,
      custom: false
    }))
  ));
  return [...carryForwardItems, ...templateItems];
}

function createInitialState() {
  return {
    items: createInitialAgendaItems(),
    internalNotes: [],
    start: emptyStartState(),
    previousJson: null,
    previousJsonValidation: emptyPreviousJsonValidation(),
    stockSummaryText: "",
    stockSummaryGeneratedAt: "",
    stockSummaryMessage: "",
    stockSaveChecklist: emptyStockSaveChecklist(),
    lastExportedFileName: "",
    exportMessage: ""
  };
}

function emptyStockSaveChecklist() {
  return STOCK_SAVE_CHECKLIST.reduce((checks, item) => {
    checks[item.id] = false;
    return checks;
  }, {});
}

function emptyPreviousJsonValidation() {
  return {
    status: "empty",
    fileName: "",
    errors: [],
    summary: null
  };
}

function emptyStartState() {
  return {
    startMode: "",
    exceptionReason: "",
    exceptionDetail: "",
    monthMismatchReason: "",
    importedPreviousFileName: "",
    importedPreviousTargetMonth: "",
    expectedPreviousTargetMonth: ""
  };
}

function isCarryForwardEligible(item) {
  return isPlainObject(item)
    && item.carryForward === true
    && !CLOSED_STATUSES.includes(item.status);
}

function getCarryForwardItems(previousJson) {
  if (!isPlainObject(previousJson) || !Array.isArray(previousJson.items)) return [];
  return previousJson.items
    .filter(isCarryForwardEligible)
    .map((item) => ({
      ...item,
      ...createNewItem({
        ...item,
        source: "previous",
        sourceLabel: "前回JSON",
        category: "previous",
        selected: true,
        custom: false
      })
    }));
}

function createNewItem(input = {}) {
  const status = VALID_STATUSES.includes(input.status) ? input.status : "open";
  const visibility = VALID_VISIBILITIES.includes(input.visibility) ? input.visibility : "client";
  const category = Object.prototype.hasOwnProperty.call(categoryLabels, input.category) ? input.category : "current";
  return {
    id: hasText(input.id) ? String(input.id).trim() : uniqueId("item"),
    title: String(input.title || "").trim(),
    detail: String(input.detail || "").trim(),
    owner: String(input.owner || "").trim(),
    dueDate: String(input.dueDate || "").trim(),
    status,
    carryForward: CLOSED_STATUSES.includes(status) ? false : input.carryForward !== false,
    visibility,
    source: hasText(input.source) ? String(input.source).trim() : "manual",
    sourceLabel: hasText(input.sourceLabel) ? String(input.sourceLabel).trim() : "",
    category,
    selected: input.selected !== false,
    custom: Boolean(input.custom)
  };
}

function updateItemStatus(itemId, status, items = []) {
  if (!VALID_STATUSES.includes(status)) return items.map((item) => ({ ...item }));
  return items.map((item) => {
    if (item.id !== itemId) return { ...item };
    return {
      ...item,
      status,
      carryForward: CLOSED_STATUSES.includes(status) ? false : item.carryForward
    };
  });
}

function moveItemWithinCategory(items = [], itemId, direction) {
  const offset = direction === "up" ? -1 : direction === "down" ? 1 : 0;
  if (!offset) return [...items];
  const currentItem = items.find((item) => item.id === itemId);
  if (!currentItem) return [...items];
  const sameCategoryItems = items.filter((item) => item.category === currentItem.category);
  const categoryIndex = sameCategoryItems.findIndex((item) => item.id === itemId);
  const targetItem = sameCategoryItems[categoryIndex + offset];
  if (!targetItem) return [...items];
  const currentIndex = items.findIndex((item) => item.id === itemId);
  const targetIndex = items.findIndex((item) => item.id === targetItem.id);
  const nextItems = [...items];
  [nextItems[currentIndex], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[currentIndex]];
  return nextItems;
}

function buildClientFacingItems(items) {
  return (Array.isArray(items) ? items : []).filter((item) => item.visibility === "client");
}

function buildInternalItems(items, internalNotes) {
  return {
    items: Array.isArray(items) ? items.map((item) => ({ ...item })) : [],
    internalNotes: buildInternalNotes(internalNotes)
  };
}

function filterCarryForwardItems(items) {
  return getCarryForwardItems({ items: Array.isArray(items) ? items : [] });
}

function buildClientFacingOutput(outputState) {
  return {
    items: buildClientFacingItems(outputState?.items || []),
    internalNotes: []
  };
}

function buildInternalOutput(outputState) {
  return buildInternalItems(outputState?.items || [], outputState?.internalNotes || []);
}

function uniqueId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function init() {
  setDefaultDates();
  renderItemEntryForms();
  bindEvents();
  resetNewItemDefaults();
  renderAll();
}

function setDefaultDates() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  $("#targetMonth").value = `${yyyy}-${mm}`;
  $("#meetingDate").value = `${yyyy}-${mm}-${dd}`;
}

function bindEvents() {
  $$("[data-step]").forEach((button) => {
    button.addEventListener("click", () => setActiveStep(button.dataset.step));
  });

  $$("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => setActiveTopic(button.dataset.tab));
  });

  formIds.forEach((id) => {
    const element = $(`#${id}`);
    if (!element) return;
    element.addEventListener("input", () => handleFormChange(id));
    element.addEventListener("change", () => handleFormChange(id));
  });

  $$("#exportJson, #exportJsonResult").forEach((button) => {
    button.addEventListener("click", exportJson);
  });
  $("#importJson").addEventListener("click", () => {
    setActiveStep("prep");
    $("#previousJsonInput").click();
  });
  $("#previousJsonInput").addEventListener("change", handlePreviousJsonImport);
  $("#clearPreviousJson").addEventListener("click", clearPreviousJson);
  $("#startWithPreviousJson").addEventListener("click", startWithPreviousJson);
  $("#startWithException").addEventListener("click", startWithException);
  $("#addInternalNote").addEventListener("click", addInternalNote);
  $("#generateStockSummary").addEventListener("click", generateStockSummary);
  $("#copyStockSummary").addEventListener("click", copyStockSummary);
  $("#stockSummaryText").addEventListener("input", () => {
    state.stockSummaryText = $("#stockSummaryText").value;
    state.stockSummaryMessage = "";
  });
  $$("[data-checklist-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.stockSaveChecklist[checkbox.dataset.checklistId] = checkbox.checked;
      renderStockSaveChecklist();
    });
  });
  $("#loadSample").addEventListener("click", loadSample);
  $("#clearDraft").addEventListener("click", clearDraft);
  $("#generateSummary").addEventListener("click", renderAll);
  $("#copyClientSummary").addEventListener("click", () => copyText("#clientSummaryText", "#copyClientSummary", "共有用コピー"));
  $("#copyInternalMemo").addEventListener("click", () => copyText("#internalMemoText", "#copyInternalMemo", "内部用コピー"));
  $("#printClientSummary").addEventListener("click", printClientSummary);
  $("#printClientAgenda").addEventListener("click", printClientSummary);
  $("#printInternalMemo").addEventListener("click", printInternalMemo);

  $$("[data-add-topic]").forEach((button) => {
    button.addEventListener("click", () => openItemEntryForm(button.dataset.addTopic));
  });
  $$("[data-add-agenda-item]").forEach((button) => {
    button.addEventListener("click", () => addAgendaItem(button.dataset.category));
  });
  $$("[data-item-entry-cancel]").forEach((button) => {
    button.addEventListener("click", () => closeItemEntryForm(button.dataset.category));
  });
}

function setActiveStep(step) {
  if (step !== "prep" && !hasStarted()) {
    state.exportMessage = "エラー: アジェンダ作成へ進むには、前回JSONで開始するか、理由を入力して例外開始してください。";
    renderAll();
    step = "prep";
  }
  $$("[data-step]").forEach((button) => button.classList.toggle("is-active", button.dataset.step === step));
  $$("[data-step-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.stepPanel === step));
}

function setActiveTopic(topic) {
  $$("[data-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === topic));
  $$("[data-topic-pane]").forEach((pane) => pane.classList.toggle("is-active", pane.dataset.topicPane === topic));
}

function renderItemEntryForms() {
  const template = $("#itemEntryTemplate");
  if (!template) return;
  Object.keys(categoryLabels).forEach((category) => {
    const slot = $(`[data-item-entry-slot="${category}"]`);
    if (!slot) return;
    slot.innerHTML = "";
    const section = template.content.firstElementChild.cloneNode(true);
    section.dataset.itemEntrySection = category;
    const title = section.querySelector("[data-item-entry-title]");
    const description = section.querySelector("[data-item-entry-description]");
    const addButton = section.querySelector("[data-add-agenda-item]");
    const cancelButton = section.querySelector("[data-item-entry-cancel]");
    if (title) title.textContent = `${categoryLabels[category]}に追加`;
    if (description) description.textContent = categoryEntryDescriptions[category];
    if (addButton) addButton.dataset.category = category;
    if (cancelButton) cancelButton.dataset.category = category;
    slot.appendChild(section);
  });
}

function getItemEntrySection(category) {
  if (!Object.prototype.hasOwnProperty.call(categoryLabels, category)) return null;
  return $(`[data-item-entry-section="${category}"]`);
}

function openItemEntryForm(category) {
  const section = getItemEntrySection(category);
  if (!section) return;
  setActiveTopic(category);
  section.hidden = false;
  section.querySelector("[data-new-item-field='title']")?.focus();
}

function closeItemEntryForm(category) {
  const section = getItemEntrySection(category);
  if (!section) return;
  section.hidden = true;
}

function itemEntryValue(category, fieldName) {
  return getItemEntrySection(category)?.querySelector(`[data-new-item-field="${fieldName}"]`)?.value.trim() || "";
}

function itemEntryChecked(category, fieldName) {
  return getItemEntrySection(category)?.querySelector(`[data-new-item-field="${fieldName}"]`)?.checked ?? false;
}

function addAgendaItem(category = "current") {
  if (!Object.prototype.hasOwnProperty.call(categoryLabels, category)) category = "current";
  const item = createNewItem({
    title: itemEntryValue(category, "title"),
    detail: itemEntryValue(category, "detail"),
    owner: itemEntryValue(category, "owner"),
    dueDate: itemEntryValue(category, "dueDate"),
    status: itemEntryValue(category, "status"),
    carryForward: itemEntryChecked(category, "carryForward"),
    visibility: itemEntryValue(category, "visibility"),
    category,
    source: "manual",
    sourceLabel: "手動追加",
    selected: true,
    custom: true
  });

  if (!hasText(item.title)) {
    state.exportMessage = "エラー: 新規事項のタイトルを入力してください。";
    renderExportMessage();
    window.alert("新規事項のタイトルを入力してください。");
    return;
  }

  state.items.push(item);
  resetItemEntryForm(category);
  state.exportMessage = "";
  renderAll();
  setActiveTopic(item.category);
  openItemEntryForm(item.category);
}

function removeAgendaItem(itemId) {
  state.items = state.items.filter((item) => item.id !== itemId);
  renderAll();
}

function moveAgendaItem(itemId, direction) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;
  state.items = moveItemWithinCategory(state.items, itemId, direction);
  renderAll();
  setActiveTopic(item.category);
}

function patchAgendaItem(itemId, changes, rerenderList = true) {
  state.items = state.items.map((item) => {
    if (item.id !== itemId) return item;
    const next = { ...item, ...changes };
    if (CLOSED_STATUSES.includes(next.status)) next.carryForward = false;
    return next;
  });
  if (rerenderList) {
    renderAll();
  } else {
    renderStatus();
    renderOutputs();
  }
}

function resetItemEntryForm(category, options = {}) {
  const section = getItemEntrySection(category);
  if (!section) return;
  section.querySelector("[data-new-item-field='title']").value = "";
  section.querySelector("[data-new-item-field='detail']").value = "";
  section.querySelector("[data-new-item-field='owner']").value = "";
  section.querySelector("[data-new-item-field='dueDate']").value = "";
  section.querySelector("[data-new-item-field='status']").value = "open";
  section.querySelector("[data-new-item-field='visibility']").value = "client";
  section.querySelector("[data-new-item-field='carryForward']").checked = true;
  if (options.hidden) section.hidden = true;
}

function resetAllItemEntryForms(options = {}) {
  Object.keys(categoryLabels).forEach((category) => resetItemEntryForm(category, options));
}

function addInternalNote() {
  const note = createInternalNote({
    title: valueOf("newInternalNoteTitle"),
    detail: valueOf("newInternalNoteDetail")
  });
  if (!hasText(note.title) && !hasText(note.detail)) {
    state.exportMessage = "エラー: 内部メモのタイトルまたは内容を入力してください。";
    renderExportMessage();
    window.alert("内部メモのタイトルまたは内容を入力してください。");
    return;
  }
  state.internalNotes.push(note);
  setValue("newInternalNoteTitle", "");
  setValue("newInternalNoteDetail", "");
  state.exportMessage = "";
  renderAll();
}

function createInternalNote(input = {}) {
  return {
    id: hasText(input.id) ? String(input.id).trim() : uniqueId("note"),
    title: String(input.title || "").trim() || "内部メモ",
    detail: String(input.detail || "").trim(),
    visibility: "internal"
  };
}

function patchInternalNote(noteId, changes, rerenderList = true) {
  state.internalNotes = state.internalNotes.map((note) => (
    note.id === noteId ? { ...note, ...changes, visibility: "internal" } : note
  ));
  if (rerenderList) {
    renderAll();
  } else {
    renderOutputs();
  }
}

function removeInternalNote(noteId) {
  state.internalNotes = state.internalNotes.filter((note) => note.id !== noteId);
  renderAll();
}

function renderAll() {
  renderStatus();
  renderStepAvailability();
  renderCandidates();
  renderCarryForwardNotice();
  renderInternalNotes();
  renderOutputs();
  renderStockSummary();
  renderStockSaveChecklist();
  renderPreviousJsonResult();
  renderStartGate();
  renderExportMessage();
}

function handleFormChange(id) {
  if (["clientCode", "targetMonth"].includes(id) && hasStarted()) {
    state.start = emptyStartState();
    state.items = createInitialAgendaItems();
    state.stockSaveChecklist = emptyStockSaveChecklist();
    state.exportMessage = "エラー: 顧客コードまたは対象月が変更されたため、開始状態を解除しました。もう一度開始してください。";
  }
  renderAll();
}

function renderStatus() {
  $("#statusClientCode").textContent = valueOf("clientCode") || "未設定";
  $("#statusTargetMonth").textContent = formatTargetMonth(valueOf("targetMonth")) || "未設定";
  $("#statusPreviousJson").textContent = previousJsonStatusText();
  $("#statusItemCount").textContent = `${collectItems().length}件`;
  $("#statusJsonName").textContent = state.lastExportedFileName || "未出力";
}

function hasStarted() {
  return state.start.startMode === "previous_json" || state.start.startMode === "exception";
}

function renderStepAvailability() {
  const started = hasStarted();
  if (!started) {
    $$("[data-step]").forEach((button) => button.classList.toggle("is-active", button.dataset.step === "prep"));
    $$("[data-step-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.stepPanel === "prep"));
  }

  $$("[data-step]").forEach((button) => {
    const locked = button.dataset.step !== "prep" && !started;
    button.disabled = locked;
    button.setAttribute("aria-disabled", String(locked));
    button.classList.toggle("is-disabled", locked);
  });
  $$("[data-step-panel]").forEach((panel) => {
    panel.classList.toggle("is-gated", panel.dataset.stepPanel !== "prep" && !started);
  });
}

function previousJsonStatusText() {
  if (state.previousJsonValidation.status === "valid") return "読込済み";
  if (state.previousJsonValidation.status === "invalid") return "エラーあり";
  return "未読込";
}

function renderCandidates() {
  Object.keys(categoryLabels).forEach((category) => {
    const container = $(`#${category}Candidates`);
    if (!container) return;
    container.innerHTML = "";
    const items = getCandidates(category);
    items.forEach((item, index) => {
      container.appendChild(renderCandidateCard(category, item, index, items.length));
    });
  });
}

function renderCandidateCard(category, item, index = 0, total = 0) {
  const template = $("#candidateTemplate");
  const card = template.content.firstElementChild.cloneNode(true);
  const enabledInput = card.querySelector("[data-item-field='selected']");
  const titleInput = card.querySelector("[data-item-field='title']");
  const source = card.querySelector(".candidate-source");
  const detailInput = card.querySelector("[data-item-field='detail']");
  const ownerInput = card.querySelector("[data-item-field='owner']");
  const dueDateInput = card.querySelector("[data-item-field='dueDate']");
  const statusInput = card.querySelector("[data-item-field='status']");
  const carryForwardInput = card.querySelector("[data-item-field='carryForward']");
  const visibilityInput = card.querySelector("[data-item-field='visibility']");
  const deleteButton = card.querySelector(".candidate-delete-button");
  const moveUpButton = card.querySelector("[data-move-item='up']");
  const moveDownButton = card.querySelector("[data-move-item='down']");
  const closed = CLOSED_STATUSES.includes(item.status);

  enabledInput.checked = item.selected !== false;
  titleInput.value = item.title;
  detailInput.value = item.detail;
  ownerInput.value = item.owner || "";
  dueDateInput.value = item.dueDate || "";
  statusInput.value = item.status;
  carryForwardInput.checked = Boolean(item.carryForward) && !closed;
  carryForwardInput.disabled = closed;
  visibilityInput.value = item.visibility;
  card.classList.toggle("is-selected", enabledInput.checked);
  card.classList.toggle("is-internal", item.visibility === "internal");
  card.classList.toggle("is-closed", closed);
  source.textContent = `${categoryLabels[category]} / ${sourceText(item)} / ${visibilityLabels[item.visibility]}`;
  moveUpButton.disabled = index === 0;
  moveDownButton.disabled = index >= total - 1;

  enabledInput.addEventListener("change", () => {
    patchAgendaItem(item.id, { selected: enabledInput.checked });
  });
  titleInput.addEventListener("input", () => {
    patchAgendaItem(item.id, { title: titleInput.value.trim() }, false);
  });
  detailInput.addEventListener("input", () => {
    patchAgendaItem(item.id, { detail: detailInput.value.trim() }, false);
  });
  ownerInput.addEventListener("change", () => {
    patchAgendaItem(item.id, { owner: ownerInput.value });
  });
  dueDateInput.addEventListener("change", () => {
    patchAgendaItem(item.id, { dueDate: dueDateInput.value });
  });
  statusInput.addEventListener("change", () => {
    state.items = updateItemStatus(item.id, statusInput.value, state.items);
    renderAll();
  });
  carryForwardInput.addEventListener("change", () => {
    patchAgendaItem(item.id, { carryForward: carryForwardInput.checked });
  });
  visibilityInput.addEventListener("change", () => {
    patchAgendaItem(item.id, { visibility: visibilityInput.value });
  });
  moveUpButton.addEventListener("click", () => moveAgendaItem(item.id, "up"));
  moveDownButton.addEventListener("click", () => moveAgendaItem(item.id, "down"));

  if (item.custom || item.source === "manual") {
    deleteButton.hidden = false;
    deleteButton.addEventListener("click", () => removeAgendaItem(item.id));
  }

  return card;
}

function sourceText(item) {
  if (item.source === "previous") return "前回JSON";
  if (item.source === "manual") return "手動追加";
  if (item.sourceLabel) return item.sourceLabel;
  return "基本";
}

function renderCarryForwardNotice() {
  const container = $("#carryForwardNotice");
  if (!container) return;
  const count = state.items.filter((item) => item.source === "previous").length;
  if (!hasStarted()) {
    container.innerHTML = `<p class="empty-note">開始後、前回JSONの未完了事項が「過去について」に自動表示されます。</p>`;
    return;
  }
  if (state.start.startMode === "exception") {
    container.innerHTML = `<p class="empty-note">例外開始のため、前回JSONからの自動繰越はありません。</p>`;
    return;
  }
  container.innerHTML = `<p>${count ? `${count}件の前回未完了事項を「過去について」に自動表示しています。` : "繰越対象の前回事項はありません。"}</p>`;
}

function renderInternalNotes() {
  const container = $("#internalNotesList");
  if (!container) return;
  container.innerHTML = "";
  if (!state.internalNotes.length) {
    container.innerHTML = `<p class="empty-note">内部メモはまだありません。顧客共有用出力には表示されません。</p>`;
    return;
  }
  state.internalNotes.forEach((note) => {
    const template = $("#internalNoteTemplate");
    const card = template.content.firstElementChild.cloneNode(true);
    const titleInput = card.querySelector("[data-note-field='title']");
    const detailInput = card.querySelector("[data-note-field='detail']");
    const deleteButton = card.querySelector(".internal-note-delete-button");
    titleInput.value = note.title;
    detailInput.value = note.detail;
    titleInput.addEventListener("input", () => {
      patchInternalNote(note.id, { title: titleInput.value.trim() }, false);
    });
    detailInput.addEventListener("input", () => {
      patchInternalNote(note.id, { detail: detailInput.value.trim() }, false);
    });
    deleteButton.addEventListener("click", () => removeInternalNote(note.id));
    container.appendChild(card);
  });
}

function renderOutputs() {
  const clientText = createClientSummaryText();
  const internalText = createInternalMemoText();
  $("#clientSummaryText").textContent = clientText;
  $("#internalMemoText").textContent = internalText;
  $("#clientAgendaView").innerHTML = createClientSummaryHtml();
  $("#internalMemoView").innerHTML = createInternalMemoHtml();
}

function renderStockSummary() {
  const textarea = $("#stockSummaryText");
  const message = $("#stockSummaryMessage");
  if (!textarea || !message) return;
  if (textarea.value !== state.stockSummaryText) textarea.value = state.stockSummaryText;
  message.classList.remove("is-success", "is-error");
  if (!state.stockSummaryMessage) {
    message.innerHTML = `<p class="empty-note">面談後、Stockノート本文へ貼り付ける要約を生成できます。顧客共有用アジェンダとは別の内部記録用テキストです。</p>`;
    return;
  }
  const isError = state.stockSummaryMessage.startsWith("エラー:");
  message.classList.add(isError ? "is-error" : "is-success");
  message.innerHTML = `<p>${escapeHtml(state.stockSummaryMessage.replace(/^エラー:\s*/, ""))}</p>`;
}

function renderStockSaveChecklist() {
  const message = $("#stockSaveChecklistMessage");
  if (!message) return;
  const checklistState = getStockSaveChecklistState(state.stockSaveChecklist);
  const hasDueDatedTasks = hasDueDatedOpenItems(collectItems());

  $$("[data-checklist-id]").forEach((checkbox) => {
    const id = checkbox.dataset.checklistId;
    checkbox.checked = Boolean(state.stockSaveChecklist[id]);
    const item = checkbox.closest(".stock-checklist-item");
    item?.classList.toggle("is-emphasis", id === "stock_tasks_registered" && hasDueDatedTasks && !checkbox.checked);
  });

  const dueTaskWarning = $("#dueTaskWarning");
  if (dueTaskWarning) dueTaskWarning.hidden = !hasDueDatedTasks;
  message.classList.remove("is-success", "is-error");
  if (checklistState.complete) {
    message.classList.add("is-success");
    message.innerHTML = `<strong>Stock保存フロー完了</strong><p>要約本文と今回JSONをStockへ戻す手順がすべて確認済みです。</p>`;
  } else {
    message.classList.add("is-error");
    message.innerHTML = `<strong>未完了の手順があります</strong><p>${checklistState.uncheckedCount}件の確認が残っています。</p>`;
  }
}

function getStockSaveChecklistState(checks) {
  const unchecked = STOCK_SAVE_CHECKLIST.filter((item) => !checks[item.id]);
  return {
    complete: unchecked.length === 0,
    uncheckedCount: unchecked.length,
    uncheckedIds: unchecked.map((item) => item.id)
  };
}

function hasDueDatedOpenItems(items) {
  return (Array.isArray(items) ? items : []).some((item) => (
    hasText(item.dueDate) && !CLOSED_STATUSES.includes(item.status)
  ));
}

function generateStockSummary() {
  const uiState = getUiState();
  state.stockSummaryText = buildStockSummary(uiState);
  state.stockSummaryGeneratedAt = toLocalIsoString(new Date());
  state.stockSummaryMessage = "Stock貼付用要約を生成しました。Stockノート本文へ貼り付けてください。";
  renderAll();
}

async function copyStockSummary() {
  if (!hasText(state.stockSummaryText)) {
    generateStockSummary();
  }
  const textarea = $("#stockSummaryText");
  const copied = await copyTextToClipboard(state.stockSummaryText);
  if (copied) {
    const button = $("#copyStockSummary");
    button.textContent = "コピー済み";
    setTimeout(() => {
      button.textContent = "要約をコピー";
    }, 1200);
    state.stockSummaryMessage = "Stock貼付用要約をコピーしました。";
  } else {
    state.stockSummaryMessage = "エラー: コピーできませんでした。テキストエリアの内容を選択して手動コピーしてください。";
    textarea?.focus();
    textarea?.select();
  }
  renderStockSummary();
}

function renderPreviousJsonResult() {
  const result = $("#previousJsonResult");
  const validation = state.previousJsonValidation;
  result.classList.remove("is-success", "is-error");

  if (validation.status === "empty") {
    result.innerHTML = `<p class="empty-note">前回JSONを選択すると、検証結果がここに表示されます。</p>`;
    return;
  }

  if (validation.status === "invalid") {
    result.classList.add("is-error");
    result.innerHTML = `
      <strong>前回JSONを読み込めませんでした</strong>
      <p>${escapeHtml(validation.fileName || "選択ファイル")}</p>
      <ul>
        ${validation.errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}
      </ul>
    `;
    return;
  }

  result.classList.add("is-success");
  result.innerHTML = `
    <strong>前回JSONを読み込みました</strong>
    <dl class="json-meta-list">
      <div><dt>ファイル名</dt><dd>${escapeHtml(validation.fileName)}</dd></div>
      <div><dt>顧客コード</dt><dd>${escapeHtml(validation.summary.clientCode)}</dd></div>
      <div><dt>顧客名</dt><dd>${escapeHtml(validation.summary.clientName || "未入力")}</dd></div>
      <div><dt>対象月</dt><dd>${escapeHtml(validation.summary.targetMonth)}</dd></div>
      <div><dt>項目数</dt><dd>${validation.summary.itemCount}件</dd></div>
      <div><dt>内部メモ</dt><dd>${validation.summary.internalNoteCount}件</dd></div>
    </dl>
  `;
}

function renderStartGate() {
  const message = $("#startGateMessage");
  const reasonField = $("#monthMismatchReasonField");
  if (!message || !reasonField) return;

  const input = getStartInput();
  const startValidation = validateStartInput(input.clientCode, input.targetMonth);
  const previousResult = canProceedWithPreviousJson(input, state.previousJson);
  const shouldShowMismatchReason = !hasStarted() && startValidation.valid && previousResult.requiresMonthMismatchReason;
  reasonField.hidden = !shouldShowMismatchReason;
  message.classList.remove("is-success", "is-error");

  if (hasStarted()) {
    message.classList.add("is-success");
    message.innerHTML = createStartedMessageHtml();
    return;
  }

  if (!startValidation.valid) {
    message.classList.add("is-error");
    message.innerHTML = `
      <strong>開始前の入力を確認してください</strong>
      <ul>${startValidation.errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul>
    `;
    return;
  }

  if (!state.previousJson) {
    message.innerHTML = `<p class="empty-note">通常ルートでは、前回JSONを読み込むまでアジェンダ作成へ進めません。</p>`;
    return;
  }

  if (!previousResult.ok) {
    message.classList.add("is-error");
    message.innerHTML = `
      <strong>${previousResult.requiresMonthMismatchReason ? "前月以外のJSONです" : "通常ルートでは開始できません"}</strong>
      ${previousResult.warnings.length ? `<p>${previousResult.warnings.map(escapeHtml).join("<br>")}</p>` : ""}
      <ul>${previousResult.errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul>
    `;
    return;
  }

  message.classList.add("is-success");
  message.innerHTML = `
    ${previousResult.warnings.length ? `<strong>前月以外のJSONです</strong><p>${previousResult.warnings.map(escapeHtml).join("<br>")}</p>` : ""}
    <p>前回JSONで開始できます。開始後、アジェンダ作成画面へ進めます。</p>
  `;
}

function createStartedMessageHtml() {
  if (state.start.startMode === "previous_json") {
    return `
      <span class="start-mode-badge">開始済み：前回JSON</span>
      <p>読込ファイル：${escapeHtml(state.start.importedPreviousFileName || "未記録")}</p>
      <p>前回対象月：${escapeHtml(state.start.importedPreviousTargetMonth || "未記録")}</p>
      ${state.start.monthMismatchReason ? `<p>前月以外で進んだ理由：${escapeHtml(state.start.monthMismatchReason)}</p>` : ""}
    `;
  }
  return `
    <span class="start-mode-badge">開始済み：例外開始</span>
    <p>例外理由：${escapeHtml(state.start.exceptionReason)}</p>
    <p>理由詳細：${escapeHtml(state.start.exceptionDetail)}</p>
  `;
}

function renderExportMessage() {
  const message = $("#exportJsonMessage");
  if (!message) return;
  message.classList.remove("is-success", "is-error");
  if (!state.exportMessage) {
    message.innerHTML = `<p class="empty-note">顧客コードと対象月を入力すると、今回JSONを出力できます。</p>`;
    return;
  }
  const isError = state.exportMessage.startsWith("エラー:");
  message.classList.add(isError ? "is-error" : "is-success");
  message.innerHTML = `<p>${escapeHtml(state.exportMessage.replace(/^エラー:\s*/, ""))}</p>`;
}

function getCandidates(category) {
  return state.items.filter((item) => item.category === category);
}

function collectItems() {
  return state.items
    .filter((item) => item.selected !== false && hasText(item.title))
    .map(exportAgendaItem);
}

function groupedItems(items = collectItems()) {
  const groups = { previous: [], current: [], next: [] };
  items.forEach((item) => {
    const category = Object.prototype.hasOwnProperty.call(groups, item.category) ? item.category : "current";
    groups[category].push(item);
  });
  return groups;
}

function exportAgendaItem(item) {
  const {
    selected,
    custom,
    sourceLabel,
    ...rest
  } = item;
  return {
    ...rest,
    id: String(item.id),
    title: String(item.title || "").trim(),
    detail: String(item.detail || "").trim(),
    owner: String(item.owner || "").trim(),
    dueDate: String(item.dueDate || "").trim(),
    status: VALID_STATUSES.includes(item.status) ? item.status : "open",
    carryForward: isCarryForwardEligible(item),
    visibility: VALID_VISIBILITIES.includes(item.visibility) ? item.visibility : "client",
    source: hasText(item.source) ? String(item.source).trim() : "manual"
  };
}

function createClientSummaryText() {
  const groups = groupedItems(buildClientFacingItems(collectItems()));
  return [
    `【${formatTargetMonth(valueOf("targetMonth")) || "対象月未設定"} 月次面談アジェンダ】`,
    `面談日：${valueOf("meetingDate") || ""}`,
    `担当：${valueOf("staffName") || ""}`,
    `対象顧客コード：${valueOf("clientCode") || ""}`,
    `顧客名：${valueOf("clientName") || ""}`,
    `対象月：${valueOf("targetMonth") || ""}`,
    "",
    "■ 今回の面談で必ず扱うテーマ",
    valueOf("meetingAim") || "-",
    "",
    "■ 過去について",
    ...textLines(groups.previous, valueOf("previousManual")),
    "",
    "■ 現在について",
    ...textLines(groups.current, valueOf("currentManual")),
    "",
    "■ 未来について",
    ...textLines(groups.next, valueOf("nextManual"))
  ].join("\n");
}

function createInternalMemoText() {
  const internal = buildInternalItems(collectItems(), state.internalNotes);
  const groups = groupedItems(internal.items);
  return [
    `【${formatTargetMonth(valueOf("targetMonth")) || "対象月未設定"} 内部用メモ】`,
    `面談日：${valueOf("meetingDate") || ""}`,
    `担当：${valueOf("staffName") || ""}`,
    `対象顧客コード：${valueOf("clientCode") || ""}`,
    `顧客名：${valueOf("clientName") || ""}`,
    `参加者：${valueOf("participants") || ""}`,
    "",
    "■ アジェンダ（過去・現在・未来）",
    ...textLines([...groups.previous, ...groups.current, ...groups.next], [
      valueOf("previousManual"),
      valueOf("currentManual"),
      valueOf("nextManual")
    ].filter(Boolean).join("\n")),
    "",
    "■ 決定事項",
    valueOf("decisions") || "-",
    "",
    "■ 顧客側の宿題",
    valueOf("clientHomework") || "-",
    "",
    "■ 事務所側の宿題",
    valueOf("officeHomework") || "-",
    "",
    "■ 内部メモ",
    ...internalNoteTextLines(internal.internalNotes),
    "",
    "■ 出力JSON",
    buildExportFileName(valueOf("clientCode") || "client", valueOf("targetMonth") || "YYYY-MM", EXPORT_VERSION)
  ].join("\n");
}

function textLines(items, manualText) {
  const lines = [];
  items.forEach((item) => {
    const meta = itemMetaText(item);
    lines.push(`- ${item.title}${meta ? `（${meta}）` : ""}`);
    if (item.detail) lines.push(`  ${item.detail}`);
  });
  if (manualText?.trim()) {
    lines.push("- 追加メモ");
    lines.push(`  ${manualText.trim().replace(/\n/g, "\n  ")}`);
  }
  return lines.length ? lines : ["-"];
}

function internalNoteTextLines(notes) {
  if (!notes.length) return ["-"];
  return notes.map((note) => `- ${note.title}${note.detail ? `：${note.detail}` : ""}`);
}

function itemMetaText(item) {
  return [
    `状態：${statusLabels[item.status] || item.status}`,
    item.owner ? `担当：${ownerLabels[item.owner] || item.owner}` : "",
    item.dueDate ? `期限：${item.dueDate}` : "",
    item.visibility === "internal" ? "内部のみ" : "",
    item.carryForward ? "次月以降繰越" : "次月以降繰越なし"
  ].filter(Boolean).join(" / ");
}

function createClientSummaryHtml() {
  const groups = groupedItems(buildClientFacingItems(collectItems()));
  return `
    <section class="document-paper">
      ${documentHero("Client Agenda", documentTitle("月次面談アジェンダ"))}
      ${metaSection()}
      ${documentSection("今回の面談で必ず扱うテーマ", paragraphOrEmpty(valueOf("meetingAim")))}
      ${documentSection("過去について", htmlList(groups.previous, valueOf("previousManual")))}
      ${documentSection("現在について", htmlList(groups.current, valueOf("currentManual")))}
      ${documentSection("未来について", htmlList(groups.next, valueOf("nextManual")))}
    </section>
  `;
}

function createInternalMemoHtml() {
  const internal = buildInternalItems(collectItems(), state.internalNotes);
  const groups = groupedItems(internal.items);
  return `
    <section class="document-paper">
      ${documentHero("Internal Memo", documentTitle("内部用メモ"))}
      ${metaSection()}
      ${documentSection("アジェンダ（過去・現在・未来）", htmlList([...groups.previous, ...groups.current, ...groups.next], [
        valueOf("previousManual"),
        valueOf("currentManual"),
        valueOf("nextManual")
      ].filter(Boolean).join("\n")))}
      ${documentSection("決定事項", paragraphOrEmpty(valueOf("decisions")))}
      ${documentSection("顧客側の宿題", paragraphOrEmpty(valueOf("clientHomework")))}
      ${documentSection("事務所側の宿題", paragraphOrEmpty(valueOf("officeHomework")))}
      ${documentSection("内部メモ", htmlInternalNotes(internal.internalNotes))}
      ${documentSection("出力JSON", `<p>${escapeHtml(buildExportFileName(valueOf("clientCode") || "client", valueOf("targetMonth") || "YYYY-MM", EXPORT_VERSION))}</p>`)}
    </section>
  `;
}

function documentTitle(suffix) {
  const month = formatTargetMonth(valueOf("targetMonth")) || "対象月未設定";
  const clientName = valueOf("clientName");
  return `${clientName ? `${clientName} 様 ` : ""}${month} ${suffix}`;
}

function documentHero(kicker, title) {
  return `
    <header class="document-hero">
      <p>${escapeHtml(kicker)}</p>
      <h2>${escapeHtml(title)}</h2>
    </header>
  `;
}

function metaSection() {
  const entries = [
    ["面談日", valueOf("meetingDate") || "-"],
    ["対象月", valueOf("targetMonth") || "-"]
  ];
  return `
    <section class="document-section">
      <div class="meta-grid">
        ${entries.map(([label, value]) => `
          <article>
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function documentSection(title, body) {
  return `
    <section class="document-section">
      <h3>${escapeHtml(title)}</h3>
      ${body}
    </section>
  `;
}

function htmlList(items, manualText) {
  const hasManual = Boolean(manualText?.trim());
  if (!items.length && !hasManual) {
    return `<p class="empty-note">未入力</p>`;
  }
  const itemHtml = items.map((item) => `
    <li>
      <strong>${escapeHtml(item.title)}</strong>
      <em>${escapeHtml(itemMetaText(item))}</em>
      ${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ""}
    </li>
  `).join("");
  const manualHtml = hasManual ? `
    <li>
      <strong>追加メモ</strong>
      <span>${escapeHtml(manualText.trim())}</span>
    </li>
  ` : "";
  return `<ol>${itemHtml}${manualHtml}</ol>`;
}

function htmlInternalNotes(notes) {
  if (!notes.length) return `<p class="empty-note">未入力</p>`;
  return `<ul>${notes.map((note) => `
    <li>
      <strong>${escapeHtml(note.title)}</strong>
      ${note.detail ? `<span>${escapeHtml(note.detail)}</span>` : ""}
    </li>
  `).join("")}</ul>`;
}

function paragraphOrEmpty(text) {
  return text?.trim() ? `<p>${escapeHtml(text.trim())}</p>` : `<p class="empty-note">未入力</p>`;
}

function buildStockSummary(summaryState) {
  const items = Array.isArray(summaryState.items) ? summaryState.items : [];
  const internalNotes = buildInternalNotes(summaryState.internalNotes);
  const groups = groupItemsForStockSummary(items, internalNotes);
  const fileName = buildExportFileName(
    summaryState.clientCode || "client",
    summaryState.targetMonth || "YYYY-MM",
    EXPORT_VERSION
  );
  return [
    `【${formatJapaneseMonth(summaryState.targetMonth)} 巡回面談】`,
    `面談日：${summaryState.meetingDate || ""}`,
    `担当：${summaryState.staffName || ""}`,
    `対象顧客コード：${summaryState.clientCode || ""}`,
    `対象月：${summaryState.targetMonth || ""}`,
    `開始方法：${startModeText(summaryState.startInfo)}`,
    "",
    "■ 今回確認事項（過去・現在・未来）",
    ...stockCategorizedItemLines(groups.confirmationItemsByCategory),
    "",
    "■ 決定事項",
    ...textBlockLines(summaryState.decisions),
    "",
    "■ 次回繰越事項",
    ...stockItemLines(groups.carryForwardItems),
    "",
    "■ 顧客側の宿題",
    ...stockHomeworkLines(groups.clientHomeworkItems, summaryState.clientHomework),
    "",
    "■ 事務所側の宿題",
    ...stockHomeworkLines(groups.officeHomeworkItems, summaryState.officeHomework),
    "",
    "■ 内部メモ",
    ...stockInternalLines(groups.internalItems, groups.internalNotes),
    "",
    "■ 添付JSON",
    fileName
  ].join("\n");
}

function formatJapaneseMonth(targetMonth) {
  return formatTargetMonth(targetMonth) || "対象月未設定";
}

function groupItemsForStockSummary(items, internalNotes) {
  const visibleItems = (Array.isArray(items) ? items : []).filter((item) => item.visibility !== "internal");
  const internalItems = (Array.isArray(items) ? items : []).filter((item) => item.visibility === "internal");
  return {
    confirmationItems: visibleItems,
    confirmationItemsByCategory: {
      previous: visibleItems.filter((item) => item.category === "previous"),
      current: visibleItems.filter((item) => item.category === "current" || !item.category),
      next: visibleItems.filter((item) => item.category === "next")
    },
    carryForwardItems: visibleItems.filter(isCarryForwardEligible),
    clientHomeworkItems: visibleItems.filter((item) => item.owner === "client"),
    officeHomeworkItems: visibleItems.filter((item) => ["office", "staff"].includes(item.owner)),
    internalItems,
    internalNotes: buildInternalNotes(internalNotes)
  };
}

function stockCategorizedItemLines(itemsByCategory) {
  const lines = [];
  ["previous", "current", "next"].forEach((category) => {
    const items = itemsByCategory?.[category] || [];
    if (!items.length) return;
    lines.push(`- ${categoryLabels[category]}`);
    stockItemLines(items).forEach((line) => lines.push(`  ${line}`));
  });
  return lines.length ? lines : ["-"];
}

function stockItemLines(items) {
  if (!items.length) return ["-"];
  return items.flatMap((item) => {
    const line = `- ${item.title}${itemMetaText(item) ? `（${itemMetaText(item)}）` : ""}`;
    return item.detail ? [line, `  ${item.detail}`] : [line];
  });
}

function stockHomeworkLines(items, manualText) {
  const lines = stockItemLines(items);
  if (hasText(manualText)) {
    if (lines.length === 1 && lines[0] === "-") lines.length = 0;
    lines.push("- 手入力メモ");
    lines.push(`  ${String(manualText).trim().replace(/\n/g, "\n  ")}`);
  }
  return lines.length ? lines : ["-"];
}

function stockInternalLines(internalItems, internalNotes) {
  const lines = [];
  if (internalItems.length) {
    lines.push("- 内部向け項目");
    stockItemLines(internalItems).forEach((line) => lines.push(`  ${line}`));
  }
  if (internalNotes.length) {
    lines.push("- 内部メモ");
    internalNoteTextLines(internalNotes).forEach((line) => lines.push(`  ${line}`));
  }
  return lines.length ? lines : ["-"];
}

function textBlockLines(text) {
  if (!hasText(text)) return ["-"];
  return String(text).trim().split(/\r?\n/).map((line) => line ? `- ${line}` : "-");
}

function startModeText(startInfo = {}) {
  if (startInfo.startMode === "previous_json") return "前回JSON読込";
  if (startInfo.startMode === "exception") {
    const reason = [startInfo.exceptionReason, startInfo.exceptionDetail].filter(hasText).join(" / ");
    return reason ? `例外開始（${reason}）` : "例外開始";
  }
  return "未開始";
}

async function copyTextToClipboard(text) {
  if (!hasText(text) || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function startWithPreviousJson() {
  const input = getStartInput();
  const startValidation = validateStartInput(input.clientCode, input.targetMonth);
  const previousResult = canProceedWithPreviousJson(input, state.previousJson);
  const errors = [...startValidation.errors, ...previousResult.errors];
  if (errors.length) {
    state.exportMessage = `エラー: ${errors.join(" ")}`;
    renderAll();
    window.alert(errors.join("\n"));
    return;
  }

  state.start = {
    startMode: "previous_json",
    exceptionReason: "",
    exceptionDetail: "",
    monthMismatchReason: previousResult.requiresMonthMismatchReason ? input.monthMismatchReason.trim() : "",
    importedPreviousFileName: state.previousJsonValidation.fileName,
    importedPreviousTargetMonth: state.previousJson.targetMonth,
    expectedPreviousTargetMonth: previousResult.expectedPreviousMonth
  };
  state.items = createInitialAgendaItems(getCarryForwardItems(state.previousJson));
  state.exportMessage = "";
  renderAll();
  setActiveStep("agenda");
}

function startWithException() {
  const input = getStartInput();
  const startValidation = validateStartInput(input.clientCode, input.targetMonth);
  const exceptionResult = canProceedWithException(valueOf("exceptionReason"), valueOf("exceptionDetail"));
  const errors = [...startValidation.errors, ...exceptionResult.errors];
  if (errors.length) {
    state.exportMessage = `エラー: ${errors.join(" ")}`;
    renderAll();
    window.alert(errors.join("\n"));
    return;
  }

  state.start = {
    startMode: "exception",
    exceptionReason: valueOf("exceptionReason"),
    exceptionDetail: valueOf("exceptionDetail"),
    monthMismatchReason: "",
    importedPreviousFileName: "",
    importedPreviousTargetMonth: "",
    expectedPreviousTargetMonth: getPreviousMonth(input.targetMonth)
  };
  state.items = createInitialAgendaItems();
  state.exportMessage = "";
  renderAll();
  setActiveStep("agenda");
}

function getStartInput() {
  return {
    clientCode: valueOf("clientCode"),
    targetMonth: valueOf("targetMonth"),
    monthMismatchReason: valueOf("monthMismatchReason")
  };
}

function isValidTargetMonth(value) {
  return parseTargetMonth(value).valid;
}

function getPreviousMonth(targetMonth) {
  const parsed = parseTargetMonth(targetMonth);
  if (!parsed.valid) return "";
  const previous = new Date(parsed.year, parsed.month - 2, 1);
  const year = previous.getFullYear();
  const month = String(previous.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getPreviousTargetMonth(targetMonth) {
  return getPreviousMonth(targetMonth);
}

function isPreviousMonth(previousTargetMonth, currentTargetMonth) {
  return isValidTargetMonth(previousTargetMonth)
    && isValidTargetMonth(currentTargetMonth)
    && previousTargetMonth === getPreviousTargetMonth(currentTargetMonth);
}

function validateStartInput(clientCode, targetMonth) {
  const errors = [];
  if (!hasText(clientCode)) errors.push("顧客コードを入力してください。");
  if (!hasText(targetMonth)) {
    errors.push("対象月を入力してください。");
  } else if (!isValidTargetMonth(targetMonth)) {
    errors.push("対象月は YYYY-MM 形式で入力してください。");
  }
  return { valid: errors.length === 0, errors };
}

function canProceedWithPreviousJson(input, previousJson) {
  const errors = [];
  const warnings = [];
  const startValidation = validateStartInput(input.clientCode, input.targetMonth);
  errors.push(...startValidation.errors);

  if (!previousJson) {
    errors.push("通常ルートでは前回JSONを読み込んでください。");
    return {
      ok: false,
      errors,
      warnings,
      expectedPreviousMonth: getPreviousMonth(input.targetMonth),
      actualPreviousMonth: "",
      requiresMonthMismatchReason: false
    };
  }

  const expectedPreviousMonth = getPreviousMonth(input.targetMonth);
  const actualPreviousMonth = previousJson.targetMonth || "";

  if (previousJson.clientCode !== input.clientCode) {
    errors.push(`読み込んだJSONの顧客コード（${previousJson.clientCode || "未設定"}）が、入力した顧客コード（${input.clientCode || "未設定"}）と一致しません。`);
  }

  if (expectedPreviousMonth && actualPreviousMonth !== expectedPreviousMonth) {
    warnings.push(`読み込んだJSONの対象月は ${actualPreviousMonth || "未設定"} です。今回対象月 ${input.targetMonth} の前月 ${expectedPreviousMonth} ではありません。`);
    if (!hasText(input.monthMismatchReason)) {
      errors.push("前月以外のJSONで進む場合は理由を入力してください。");
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    expectedPreviousMonth,
    actualPreviousMonth,
    requiresMonthMismatchReason: warnings.length > 0
  };
}

function canProceedWithException(exceptionReason, exceptionDetail) {
  const errors = [];
  if (!hasText(exceptionReason)) {
    errors.push("例外理由を選択してください。");
  } else if (!EXCEPTION_REASONS.includes(exceptionReason)) {
    errors.push("例外理由は指定された選択肢から選んでください。");
  }
  if (!hasText(exceptionDetail)) {
    errors.push(exceptionReason === "その他"
      ? "「その他」を選んだ場合は理由詳細を入力してください。"
      : "例外開始の理由詳細を入力してください。");
  }
  return { ok: errors.length === 0, errors };
}

function validateAgendaJson(data) {
  const errors = [];
  if (!isPlainObject(data)) {
    return { valid: false, errors: ["JSONの最上位はオブジェクトである必要があります。"], data: null };
  }

  if (!hasText(data.schemaVersion)) errors.push("schemaVersion がありません。");
  if (!hasText(data.clientCode)) errors.push("clientCode がありません。");
  if (!parseTargetMonth(data.targetMonth).valid) errors.push("targetMonth は YYYY-MM 形式で入力してください。");
  if (!Array.isArray(data.items)) errors.push("items は配列である必要があります。");
  if (!Array.isArray(data.internalNotes)) errors.push("internalNotes は配列である必要があります。");

  if (Array.isArray(data.items)) {
    data.items.forEach((item, index) => {
      const label = `items[${index + 1}]`;
      if (!isPlainObject(item)) {
        errors.push(`${label} はオブジェクトである必要があります。`);
        return;
      }
      if (!hasText(item.id)) errors.push(`${label}.id がありません。`);
      if (!hasText(item.title)) errors.push(`${label}.title がありません。`);
      if (!hasText(item.status)) errors.push(`${label}.status がありません。`);
      if (typeof item.carryForward !== "boolean") errors.push(`${label}.carryForward は true / false で指定してください。`);
      if (!hasText(item.visibility)) errors.push(`${label}.visibility がありません。`);
      if (hasText(item.status) && !VALID_STATUSES.includes(item.status)) {
        errors.push(`${label}.status は open / in_progress / done / on_hold / withdrawn のいずれかにしてください。`);
      }
      if (hasText(item.visibility) && !VALID_VISIBILITIES.includes(item.visibility)) {
        errors.push(`${label}.visibility は client / internal のいずれかにしてください。`);
      }
    });
  }

  if (Array.isArray(data.internalNotes)) {
    data.internalNotes.forEach((note, index) => {
      const label = `internalNotes[${index + 1}]`;
      if (!isPlainObject(note)) {
        errors.push(`${label} はオブジェクトである必要があります。`);
        return;
      }
      if (hasText(note.visibility) && !VALID_VISIBILITIES.includes(note.visibility)) {
        errors.push(`${label}.visibility は client / internal のいずれかにしてください。`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? normalizeAgendaJson(data) : null
  };
}

function normalizeAgendaJson(data) {
  return {
    ...data,
    schemaVersion: String(data.schemaVersion),
    clientCode: String(data.clientCode).trim(),
    clientName: hasText(data.clientName) ? String(data.clientName).trim() : "",
    targetMonth: String(data.targetMonth).trim(),
    createdAt: hasText(data.createdAt) ? String(data.createdAt) : "",
    createdBy: hasText(data.createdBy) ? String(data.createdBy) : "",
    meeting: isPlainObject(data.meeting) ? { ...data.meeting } : {},
    items: data.items.map((item) => ({ ...item })),
    internalNotes: data.internalNotes.map((note) => ({ ...note })),
    exportInfo: isPlainObject(data.exportInfo) ? { ...data.exportInfo } : {}
  };
}

function buildExportJson(uiState) {
  const exportedFileName = buildExportFileName(uiState.clientCode, uiState.targetMonth, EXPORT_VERSION);
  const now = toLocalIsoString(new Date());
  return {
    schemaVersion: SCHEMA_VERSION,
    clientCode: uiState.clientCode,
    clientName: uiState.clientName,
    targetMonth: uiState.targetMonth,
    createdAt: now,
    createdBy: uiState.staffName,
    meeting: {
      meetingDate: uiState.meetingDate,
      staffName: uiState.staffName,
      participants: uiState.participants,
      summary: uiState.meetingAim,
      decisions: uiState.decisions,
      clientHomework: uiState.clientHomework,
      officeHomework: uiState.officeHomework
    },
    startInfo: {
      startMode: uiState.startInfo.startMode,
      exceptionReason: uiState.startInfo.exceptionReason,
      exceptionDetail: uiState.startInfo.exceptionDetail,
      monthMismatchReason: uiState.startInfo.monthMismatchReason,
      importedPreviousFileName: uiState.startInfo.importedPreviousFileName,
      importedPreviousTargetMonth: uiState.startInfo.importedPreviousTargetMonth,
      expectedPreviousTargetMonth: uiState.startInfo.expectedPreviousTargetMonth
    },
    items: uiState.items.map((item) => ({ ...item })),
    internalNotes: buildInternalNotes(uiState.internalNotes),
    generatedStockSummary: {
      text: uiState.generatedStockSummary?.text || "",
      generatedAt: uiState.generatedStockSummary?.generatedAt || ""
    },
    exportInfo: {
      exportedFileName,
      exportedAt: now,
      version: EXPORT_VERSION
    }
  };
}

function buildInternalNotes(text) {
  if (Array.isArray(text)) {
    return text
      .filter((note) => hasText(note?.title) || hasText(note?.detail))
      .map((note) => ({
        ...note,
        id: hasText(note.id) ? String(note.id).trim() : uniqueId("note"),
        title: hasText(note.title) ? String(note.title).trim() : "内部メモ",
        detail: hasText(note.detail) ? String(note.detail).trim() : "",
        visibility: "internal"
      }));
  }
  const detail = String(text || "").trim();
  if (!detail) return [];
  return [
    {
      id: "note-001",
      title: "内部メモ",
      detail,
      visibility: "internal"
    }
  ];
}

function buildExportFileName(clientCode, targetMonth, version = EXPORT_VERSION) {
  const code = safeFilePart(clientCode);
  const month = safeFilePart(targetMonth);
  const versionText = String(version).padStart(3, "0");
  return `junkai_${code}_${month}_v${versionText}.json`;
}

function parseTargetMonth(value) {
  const text = String(value || "").trim();
  const match = /^(\d{4})-(\d{2})$/.exec(text);
  if (!match) return { valid: false, value: text, year: null, month: null };
  const month = Number(match[2]);
  return {
    valid: month >= 1 && month <= 12,
    value: text,
    year: Number(match[1]),
    month
  };
}

function getUiState() {
  return {
    clientCode: valueOf("clientCode"),
    clientName: valueOf("clientName"),
    targetMonth: valueOf("targetMonth"),
    meetingDate: valueOf("meetingDate"),
    staffName: valueOf("staffName"),
    participants: valueOf("participants"),
    meetingAim: valueOf("meetingAim"),
    decisions: valueOf("decisions"),
    clientHomework: valueOf("clientHomework"),
    officeHomework: valueOf("officeHomework"),
    internalNotes: buildInternalNotes(state.internalNotes),
    items: collectItems(),
    startInfo: { ...state.start },
    generatedStockSummary: {
      text: state.stockSummaryText,
      generatedAt: state.stockSummaryGeneratedAt
    }
  };
}

function validateExportInputs(uiState) {
  const errors = [];
  if (!hasStarted()) errors.push("開始フローを完了してください。");
  if (!hasText(uiState.clientCode)) errors.push("顧客コードを入力してください。");
  if (!parseTargetMonth(uiState.targetMonth).valid) errors.push("対象月を YYYY-MM 形式で入力してください。");
  return errors;
}

function exportJson() {
  const uiState = getUiState();
  const errors = validateExportInputs(uiState);
  if (errors.length) {
    state.exportMessage = `エラー: ${errors.join(" ")}`;
    renderExportMessage();
    window.alert(errors.join("\n"));
    return;
  }

  const payload = buildExportJson(uiState);
  const validation = validateAgendaJson(payload);
  if (!validation.valid) {
    state.exportMessage = `エラー: 出力JSONの検証に失敗しました。${validation.errors.join(" ")}`;
    renderExportMessage();
    window.alert(validation.errors.join("\n"));
    return;
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = payload.exportInfo.exportedFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  state.lastExportedFileName = payload.exportInfo.exportedFileName;
  state.stockSaveChecklist.json_exported = true;
  state.exportMessage = `${payload.exportInfo.exportedFileName} を出力しました。Stockノートへ添付してください。`;
  renderAll();
}

async function handlePreviousJsonImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (state.start.startMode === "previous_json") {
    state.start = emptyStartState();
    state.items = createInitialAgendaItems();
  }
  try {
    const payload = JSON.parse(await file.text());
    const validation = validateAgendaJson(payload);
    if (!validation.valid) {
      state.previousJson = null;
      state.previousJsonValidation = {
        status: "invalid",
        fileName: file.name,
        errors: validation.errors,
        summary: null
      };
      renderAll();
      return;
    }

    state.previousJson = validation.data;
    state.previousJsonValidation = {
      status: "valid",
      fileName: file.name,
      errors: [],
      summary: summarizeAgendaJson(validation.data)
    };
    renderAll();
  } catch {
    state.previousJson = null;
    state.previousJsonValidation = {
      status: "invalid",
      fileName: file.name,
      errors: ["JSONとして読み込めません。ファイル内容を確認してください。"],
      summary: null
    };
    renderAll();
  } finally {
    event.target.value = "";
  }
}

function summarizeAgendaJson(data) {
  return {
    clientCode: data.clientCode,
    clientName: data.clientName,
    targetMonth: data.targetMonth,
    itemCount: data.items.length,
    internalNoteCount: data.internalNotes.length,
    exportedFileName: data.exportInfo?.exportedFileName || ""
  };
}

function clearPreviousJson() {
  state.previousJson = null;
  state.previousJsonValidation = emptyPreviousJsonValidation();
  if (state.start.startMode === "previous_json") {
    state.start = emptyStartState();
    state.items = createInitialAgendaItems();
  }
  renderAll();
}

function loadSample() {
  setValue("clientCode", "TEST001");
  setValue("clientName", "サンプル顧客");
  setValue("staffName", "サンプル担当者");
  setValue("participants", "代表者、経理担当");
  setValue("meetingAim", "過去実績、現在の納付予定、未来の着地予測を整理する。");
  setValue("decisions", "業績着地予測に必要な前提条件を次回までに確認する。");
  setValue("clientHomework", "必要資料と納付予定を確認し、期限までに共有する。");
  setValue("officeHomework", "過去実績と短期経営計画の論点を整理し、次回繰越事項を確認する。");
  state.items = createInitialAgendaItems();
  state.internalNotes = [
    createInternalNote({
      title: "共有前確認",
      detail: "顧客共有前に表現を確認する。"
    })
  ];
  state.start = emptyStartState();
  state.items = state.items.map((item) => {
    const selected = item.title.includes("過去") || item.title.includes("中間納税") || item.title.includes("業績着地");
    return { ...item, selected };
  });
  state.stockSummaryText = "";
  state.stockSummaryGeneratedAt = "";
  state.stockSummaryMessage = "";
  state.stockSaveChecklist = emptyStockSaveChecklist();
  state.lastExportedFileName = "";
  state.exportMessage = "";
  renderAll();
}

function clearDraft() {
  if (!window.confirm("画面の入力内容を初期化します。よろしいですか？")) return;
  formIds.forEach((id) => setValue(id, ""));
  state = createInitialState();
  setDefaultDates();
  resetNewItemDefaults();
  renderAll();
}

function resetNewItemDefaults() {
  resetAllItemEntryForms({ hidden: true });
}

async function copyText(sourceSelector, buttonSelector, originalLabel) {
  const text = $(sourceSelector).textContent;
  try {
    await navigator.clipboard.writeText(text);
    const button = $(buttonSelector);
    button.textContent = "コピー済み";
    setTimeout(() => {
      button.textContent = originalLabel;
    }, 1200);
  } catch {
    window.alert("コピーできませんでした。対象の文章を選択してコピーしてください。");
  }
}

function printClientSummary() {
  printWithClass("print-client-summary");
}

function printInternalMemo() {
  printWithClass("print-internal-memo");
}

function printWithClass(className) {
  document.body.classList.add(className);
  const cleanup = () => {
    document.body.classList.remove(className);
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
}

function safeFilePart(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "blank";
}

function formatTargetMonth(value) {
  const parsed = parseTargetMonth(value);
  if (!parsed.valid) return "";
  return `${parsed.year}年${String(parsed.month).padStart(2, "0")}月`;
}

function valueOf(id) {
  return $(`#${id}`)?.value.trim() || "";
}

function setValue(id, value) {
  const element = $(`#${id}`);
  if (element) element.value = value || "";
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toLocalIsoString(date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const offset = `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  const local = new Date(date.getTime() + offsetMinutes * 60000).toISOString().slice(0, 19);
  return `${local}${offset}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br>");
}

if (typeof window !== "undefined") {
  window.junkaiJson = {
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
  };
  init();
}
