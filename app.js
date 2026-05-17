let instructionData = {
  corporate: {
    pdf: "./所長の指示事項 法人.pdf",
    label: "法人",
    months: {
      1: [
        instruction("TPS1000仕訳読込後の確認", "前期末後決算仕訳・開始残高・残高移行に違和感がないか確認します。", "past"),
        instruction("役員報酬・給与変更の確認", "社会保険・賞与・給与改定の有無を確認します。", "present")
      ],
      2: [
        instruction("決算申告書控の保存・共有確認", "決算申告書控、決算報告書、別表等の保管状況を確認します。", "past"),
        instruction("役員給与・登記事項の確認", "定期同額給与、事前確定届出給与、役員変更登記の必要性を確認します。", "present")
      ],
      3: [
        instruction("MAS第1回検討会", "第1四半期の着地を確認し、期首計画との差を整理します。", "present"),
        instruction("中間申告1回目の要否確認", "中間申告・予定納税の有無と納付時期を確認します。", "future")
      ],
      4: [
        instruction("源泉所得税・住民税の納付確認", "納期の特例や毎月納付の対象を確認します。", "present")
      ],
      5: [
        instruction("中間決算に向けた予測確認", "上期の利益・納税・資金繰りの見通しを確認します。", "future")
      ],
      6: [
        instruction("MAS第2回検討会", "半期時点の実績と計画差、下期の打ち手を確認します。", "present"),
        instruction("中間申告通知・仮決算要否確認", "予定申告か仮決算か、判断に必要な資料を確認します。", "future")
      ],
      7: [
        instruction("法人税・地方税の中間納付確認", "中間納付書、納付期限、資金手当てを確認します。", "present")
      ],
      8: [
        instruction("電子帳簿保存・証憑管理の確認", "電子取引データ、請求書、領収書の保存状況を確認します。", "present")
      ],
      9: [
        instruction("MAS第3回検討会", "第3四半期の着地を確認し、決算までの見通しを整理します。", "future")
      ],
      10: [
        instruction("決算前検討会", "決算予測、納税見込、役員報酬、在庫・売掛・借入を確認します。", "future"),
        instruction("源泉所得税の納付確認", "納期の特例対象の納付時期と金額を確認します。", "present")
      ],
      11: [
        instruction("消費税区分・届出の確認", "本則・簡易、課税事業者選択、インボイス、届出期限を確認します。", "future"),
        instruction("次年度計画の素案作成", "来期の売上、粗利、人員、投資、資金の前提を整理します。", "future")
      ],
      12: [
        instruction("決算直前チェック", "売上・仕入・棚卸・固定資産・役員貸付借入・未払計上を確認します。", "present"),
        instruction("決算後の面談論点整理", "申告後に説明すべき事項、来期へ持ち越す課題を整理します。", "future")
      ]
    }
  },
  individual: {
    pdf: "./所長の指示事項 個人.pdf",
    label: "個人",
    months: {
      1: [
        instruction("TPS2000仕訳読込後の確認", "前年からの繰越、開始残高、事業主貸借の整合を確認します。", "past"),
        instruction("給与・専従者給与変更の確認", "専従者給与、給与改定、社会保険・源泉の変更を確認します。", "present")
      ],
      2: [
        instruction("確定申告控・納税資料の整理", "申告書控、決算書、納付書、還付資料の保管状況を確認します。", "past")
      ],
      3: [
        instruction("MAS第1回検討会", "1月からの実績と年間見込みを確認します。", "present"),
        instruction("中間申告1回目の要否確認", "消費税等の中間申告が必要か確認します。", "future")
      ],
      4: [
        instruction("源泉所得税・住民税の納付確認", "納付時期、特例対象、従業員分の確認を行います。", "present")
      ],
      5: [
        instruction("納付書・予定納税の確認", "所得税・住民税・事業税等の納付予定と資金手当てを確認します。", "present"),
        instruction("事業関連資産の異動確認", "車両、設備、借入、固定資産の取得・売却を確認します。", "past")
      ],
      6: [
        instruction("MAS第2回検討会", "上期見込み、予定納税、資金繰りを整理します。", "present"),
        instruction("予定納税・関与先への税額説明", "所得税の予定納税額と納付予定を確認します。", "future")
      ],
      7: [
        instruction("予定納税第1期の確認", "納付期限、納付方法、資金繰りへの影響を確認します。", "present")
      ],
      8: [
        instruction("電子帳簿保存法の適用確認", "電子取引データの保存、領収書・請求書の運用を確認します。", "present")
      ],
      9: [
        instruction("MAS第3回検討会", "年末までの利益・納税・資金繰りを確認します。", "future")
      ],
      10: [
        instruction("決算前検討会", "年末着地、節税余地、納税資金、設備投資予定を確認します。", "future"),
        instruction("源泉所得税の納付確認", "納期の特例、年末調整前の源泉税額を確認します。", "present")
      ],
      11: [
        instruction("予定納税第2期の確認", "納付期限、納付額、資金繰りを確認します。", "present"),
        instruction("翌年の消費税・インボイス確認", "課税方式、届出、簡易課税、本則課税の判断を確認します。", "future")
      ],
      12: [
        instruction("確定申告前チェック", "売上・経費・棚卸・家事按分・固定資産・控除資料を確認します。", "present"),
        instruction("来年の経営計画・納税見通し", "翌年の売上目標、投資、資金、納税見通しを整理します。", "future")
      ]
    }
  }
};

instructionData = {
  corporate: {
    pdf: "./所長の指示事項 法人.pdf",
    label: "法人",
    auditMonths: {
      1: [
        instructionLine("期首 1か月目", "TPS1000仕訳読込、期首振替仕訳の確認（締め後決算整理仕訳・繰越利益剰余金等）しない", "past"),
        instructionLine("期首 1か月目", "月次定型仕訳の金額変更（概算減価償却費・賞与引当金等） する 決算月", "present")
      ],
      2: [
        instructionLine("期首 2か月目", "「決算報告書綴」の交付 する 決算月", "past"),
        instructionLine("期首 2か月目", "株主総会議事録、取締役会議事録、役員変更等の登記関係の確認・指導する 決算月", "present"),
        instructionLine("期首 2か月目", "「定期同額給与」「事前確定届出給与」の意向確認・指導 する  1か月後", "present")
      ],
      3: [
        instructionLine("期首 3か月目", "【継続MAS】第1四半期業績検討会の開催 しない", "present"),
        instructionLine("期首 3か月目", "業況により消費税の中間申告（1回目）について仮決算による方法を検討しない", "future")
      ],
      4: [
        instructionLine("期首 4か月目", "消費税中間納付書（１回目）による納付指導 する 決算月", "present")
      ],
      5: [
        instructionLine("期首 5か月目", "中間決算に向けての予実対比 する 決算月", "future")
      ],
      6: [
        instructionLine("期首 6か月目", "【継続MAS】第2四半期業績検討会の開催 する 決算月", "present"),
        instructionLine("期首 6か月目", "中間申告（予定申告)通知の有無および業況による仮決算の必要性の確認する 決算月", "future"),
        instructionLine("期首 6か月目", "仮決算による中間申告の場合の本決算に準ずる処理の説明 する 決算月", "future")
      ],
      7: [
        instructionLine("期首 7か月目", "法人(地方)税の中間（予定）納付書・消費税中間納付書（2回目）による納付指導する 決算月", "present")
      ],
      9: [
        instructionLine("期首 9か月目", "【継続MAS】第3四半期業績検討会の開催 する 決算月", "future"),
        instructionLine("期首 9か月目", "業況により消費税の中間申告（3回目）について仮決算による方法を検討しない", "future")
      ],
      10: [
        instructionLine("期首10か月目", "【継続MAS】決算事前検討会の開催（利益・納税の予測、黒字・赤字対策）する 決算月", "future"),
        instructionLine("期首10か月目", "【継続MAS】短期経営計画策定会の開催 する 決算月", "future"),
        instructionLine("期首10か月目", "消費税中間納付書（3回目）による納付指導 する 決算月", "present")
      ],
      11: [
        instructionLine("期首11か月目", "消費税課税ﾎﾟｼﾞｼｮﾝの検討（本則or簡易／免税or課税）※設備投資計画などに注意する 決算月", "future"),
        instructionLine("期首11か月目", "各種届出書の確認（消費税の簡易・本則、課税事業者選択・減価償却方法等）する 決算月", "future"),
        instructionLine("期首11か月目", "次年度会計用品の準備 する 決算月", "future")
      ],
      12: [
        instructionLine("期首12か月目", "【継続MAS】短期経営計画の策定・自計化ｼｽﾃﾑへの予算登録 する 決算月", "future"),
        instructionLine("期首12か月目", "今期決算の概算納税額と翌期の概算予定納税額の説明 する 決算月", "future")
      ]
    },
    calendarMonths: {
      5: [
        instructionLine("5月分", "源泉所得税（納期特例）の納付書作成指導、納付依頼（7/10期限） する 決算月", "present")
      ],
      10: [
        instructionLine("10月分", "源泉所得税（納期特例）の納付準備・指導（年末調整による超過税額、報酬料金に注意）する 決算月", "present"),
        instructionLine("10月分", "＜年末調整＞準備のお知らせ・ｽｹｼﾞｭｰﾙ確認 する 決算月", "present")
      ],
      11: [
        instructionLine("11月分", "＜年末調整＞資料の回収、過納額の還付手続きの是非確認 する 決算月", "present"),
        instructionLine("11月分", "償却資産税申告の準備・資産異動の確認 する 決算月", "present"),
        instructionLine("11月分", "本年分　所得税「確定申告の準備のお願い」の提供 する 決算月", "future")
      ],
      12: [
        instructionLine("12月分", "源泉所得税（納期特例）の納付指導（1/20期限） する 決算月", "present"),
        instructionLine("12月分", "関係する税制改正大綱の情報提供 する 決算月", "future")
      ]
    },
    recurring: [
      instructionLine("毎月", "「仕訳に関する指摘事項」のﾌｧｲﾘﾝｸﾞ指導（日々の業績数値の精度を高める！）しない", "present"),
      instructionLine("毎月", "変動PL等管理会計ﾒﾆｭｰを見て社長と対話（限界利益率・予実対比・ﾋｱﾘﾝｸﾞ）しない", "present"),
      instructionLine("毎月", "社長のｽﾏﾎの「それ、売上に直すといくらですか？」の限界利益率を更新しない", "present"),
      instructionLine("毎月", "翌月の監査日を決定→ｽｹｼﾞｭｰﾗに登録 しない", "present")
    ]
  },
  individual: {
    pdf: "./所長の指示事項 個人.pdf",
    label: "個人",
    auditMonths: {},
    calendarMonths: {
      1: [
        instructionLine("1月分", "TPS2000仕訳読込、期首振替仕訳の確認（締め後決算整理仕訳・事業主勘定の元入金等）する 決算月", "past"),
        instructionLine("1月分", "月次定型仕訳の変更確認（概算減価償却費・賞与引当金等） する 決算月", "present"),
        instructionLine("1月分", "法定調書・給与支払報告書・償却資産申告書提出 する 決算月", "present")
      ],
      3: [
        instructionLine("3月分", "【継続MAS】第1四半期業績検討会の開催 する 決算月", "present"),
        instructionLine("3月分", "業況により消費税の中間申告（1回目）について仮決算による方法を検討する 決算月", "future")
      ],
      5: [
        instructionLine("5月分", "源泉所得税（納期特例）の納付書作成指導、納付依頼（7/10期限） する 決算月", "present"),
        instructionLine("5月分", "所得税減額申請の必要性を検討（必要な場合は準備） する 決算月", "future"),
        instructionLine("5月分", "家事関連費の按分の確認 する 決算月", "present")
      ],
      6: [
        instructionLine("6月分", "【継続MAS】第2四半期業績検討会の開催 する 決算月", "present"),
        instructionLine("6月分", "消費税予定申告の確認・関与先への税額の報告 する 決算月", "future")
      ],
      7: [
        instructionLine("7月分", "所得税予定納税第1期（7/31）の税額を報告 する 決算月", "present")
      ],
      8: [
        instructionLine("8月分", "電子帳簿保存法の適用の要件確認（申請は備付開始日の3か月前迄） する 決算月", "present")
      ],
      9: [
        instructionLine("9月分", "【継続MAS】第3四半期業績検討会の開催 する 決算月", "future"),
        instructionLine("9月分", "所得税減額申請の必要性を検討（必要な場合は準備） する 決算月", "future")
      ],
      10: [
        instructionLine("10月分", "【継続MAS】決算事前検討会の開催（利益・納税の予測、黒字・赤字対策）する 決算月", "future"),
        instructionLine("10月分", "【継続MAS】短期経営計画策定会の開催 する 決算月", "future"),
        instructionLine("10月分", "源泉所得税（納期特例）の納付準備・指導（年末調整による超過税額、報酬料金に注意）する 決算月", "present"),
        instructionLine("10月分", "＜年末調整＞準備のお知らせ・ｽｹｼﾞｭｰﾙ確認 する 決算月", "present")
      ],
      11: [
        instructionLine("11月分", "所得税予定納税第2期（11/30）の税額を報告 する 決算月", "present"),
        instructionLine("11月分", "源泉所得税（納期特例）の納付指導（1/20期限） する 決算月", "present"),
        instructionLine("11月分", "＜年末調整＞資料の回収、過納額の還付手続きの是非確認 する 決算月", "present"),
        instructionLine("11月分", "償却資産税申告の準備・資産異動の確認 する 決算月", "present"),
        instructionLine("11月分", "次年度会計用品の準備 する 決算月", "future"),
        instructionLine("11月分", "各種届出書の確認（消費税の簡易・本則、課税事業者選択、減価償却方法等）する 決算月", "future"),
        instructionLine("11月分", "消費税課税ﾎﾟｼﾞｼｮﾝの検討（本則or簡易／免税or課税）※設備投資計画などに注意する 決算月", "future")
      ],
      12: [
        instructionLine("12月分", "【継続MAS】短期経営計画の策定、自計化ｼｽﾃﾑへの予算の登録 する 決算月", "future"),
        instructionLine("12月分", "今期決算の概算納税額と翌期の概算予定納税額の説明 する 決算月", "future"),
        instructionLine("12月分", "関係する税制改正大綱の情報提供 する 決算月", "future")
      ]
    },
    recurring: [
      instructionLine("毎月", "変動PL等管理会計ﾒﾆｭｰを見て事業主と対話（限界利益率・予実対比・ﾋｱﾘﾝｸﾞ）しない", "present"),
      instructionLine("毎月", "社長のｽﾏﾎの「それ、売上げに直すといくらですか？」の限界利益率を更新しない", "present"),
      instructionLine("毎月", "翌月の監査日を決定→ｽｹｼﾞｭｰﾗに登録 しない", "present")
    ]
  }
};

const baseCandidates = {
  past: [
    candidate("前回宿題の進捗確認", "前回決めたことが実行済み・途中・未着手のどれかを確認します。", "基本"),
    candidate("前月からの数字の変化", "売上、粗利、固定費、資金残高で大きく動いたものを確認します。", "基本"),
    candidate("過去の打ち手の効果確認", "投資、採用、借入、値上げなど過去の判断の効果を確認します。", "基本")
  ],
  present: [
    candidate("月次試算表の要点確認", "売上、粗利、固定費、営業利益、資金残高の現在地を確認します。", "基本"),
    candidate("資金繰りと近い支払い", "納税、社会保険、借入返済、大きな支払い予定を確認します。", "基本"),
    candidate("現場・人員・業務の詰まり", "採用、定着、教育、業務量、経理資料の遅れを確認します。", "基本")
  ],
  future: [
    candidate("決算着地と納税見込み", "利益着地、納税予測、決算までの修正余地を確認します。", "基本"),
    candidate("次の3か月の資金見通し", "入金予定と支払予定を並べ、資金が薄くなる月を確認します。", "基本"),
    candidate("次回までの宿題整理", "誰が、いつまでに、何を確認すれば次回の判断が進むか整理します。", "基本")
  ]
};

const categoryLabels = {
  past: "過去",
  present: "現在",
  future: "未来"
};

const categoryHeadings = {
  past: "過去：経緯と前回宿題",
  present: "現在：月次数値と監査確認",
  future: "未来：決算・納税・次の打ち手"
};

const draftKey = "monthlyAuditMeetingDraftV1";
const recordKey = "monthlyAuditMeetingRecordsV1";
const formIds = ["entityType", "clientName", "fiscalMonth", "visitMonth", "visitDate", "participants", "meetingAim", "pastManual", "presentManual", "futureManual", "decisions", "homework", "reflection"];
let restoredCandidates = {};
let monthlyAnalysis = {
  balance: null,
  profit: null,
  suggestions: []
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function instruction(title, detail, category) {
  return { title, detail, category, source: "所長指示" };
}

function instructionLine(scope, text, category) {
  return {
    title: `${scope} ${text}`,
    detail: "",
    category,
    source: "所長指示",
    scope,
    text
  };
}

function candidate(title, detail, source) {
  return { title, detail, source };
}

function init() {
  populateMonthSelects();
  bindEvents();
  setDefaultDate();
  restoreDraft();
  renderAll();
  renderRecords();
}

function populateMonthSelects() {
  const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return `<option value="${month}">${month}月</option>`;
  }).join("");
  $("#fiscalMonth").innerHTML = monthOptions;
  $("#visitMonth").innerHTML = monthOptions;
}

function bindEvents() {
  formIds.forEach((id) => {
    $(`#${id}`).addEventListener("input", handleInputChange);
    $(`#${id}`).addEventListener("change", handleInputChange);
  });

  $$(".flow-tab").forEach((tab) => {
    tab.addEventListener("click", () => activateStep(tab.dataset.step));
  });

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  $("#generateSummary").addEventListener("click", renderSummaries);
  $("#copyClientSummary").addEventListener("click", () => copyText("#clientSummaryText", "#copyClientSummary", "要約版コピー"));
  $("#copyDetailedSummary").addEventListener("click", () => copyText("#detailedSummaryText", "#copyDetailedSummary", "詳細版コピー"));
  $("#printClientSummary").addEventListener("click", printClientSummary);
  $("#printClientAgenda").addEventListener("click", printClientSummary);
  $("#printDetailedSummary").addEventListener("click", printDetailedSummary);
  $("#printMonthlyReport").addEventListener("click", printMonthlyReport);
  $("#copyMonthlyReport").addEventListener("click", () => copyText("#monthlyReportText", "#copyMonthlyReport", "レポートコピー"));
  $("#balanceCsvInput").addEventListener("change", (event) => handleCsvImport("balance", event.target.files[0]));
  $("#profitCsvInput").addEventListener("change", (event) => handleCsvImport("profit", event.target.files[0]));
  $("#loadSample").addEventListener("click", loadSample);
  $("#clearDraft").addEventListener("click", clearDraft);
  $("#saveRecord").addEventListener("click", saveRecord);
}

function activateStep(step) {
  $$(".flow-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.step === step);
  });
  $$("[data-step-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.stepPanel === step);
  });
}

function handleInputChange() {
  renderAll();
  saveDraft();
}

function setDefaultDate() {
  const now = new Date();
  if (!$("#visitDate").value) $("#visitDate").value = now.toISOString().slice(0, 10);
  if (!$("#visitMonth").value) $("#visitMonth").value = String(now.getMonth() + 1);
}

function switchTab(category) {
  $$(".tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === category));
  $$("[data-topic-pane]").forEach((pane) => {
    pane.classList.toggle("is-active", pane.dataset.topicPane === category);
  });
}

function renderAll() {
  refreshMonthlySuggestions();
  renderAuditPreparation();
  renderCandidates();
  renderSummaries();
  renderMonthlyReport();
  renderStatus();
}

function readState() {
  return Object.fromEntries(formIds.map((id) => [id, $(`#${id}`).value.trim()]));
}

function auditMonthIndex() {
  const fiscal = Number($("#fiscalMonth").value);
  const visit = Number($("#visitMonth").value);
  if (!fiscal || !visit) return null;
  return ((visit - fiscal + 11) % 12) + 1;
}

function currentInstructions() {
  const entity = $("#entityType").value;
  const index = auditMonthIndex();
  const visit = Number($("#visitMonth").value);
  const data = instructionData[entity];
  return [
    ...(index ? data.auditMonths[index] || [] : []),
    ...(visit ? data.calendarMonths[visit] || [] : []),
    ...(data.recurring || [])
  ];
}

function renderAuditPreparation() {
  const entity = $("#entityType").value;
  const index = auditMonthIndex();
  const data = instructionData[entity];
  const instructions = currentInstructions();

  $("#pdfLink").href = data.pdf;
  $("#pdfFrame").src = `${data.pdf}#page=1&zoom=page-width`;

  if (!index && !Number($("#visitMonth").value)) {
    $("#auditMonthTitle").textContent = "決算月と訪問月を選択してください";
    $("#auditMonthDescription").textContent = "毎月項目は常時表示、○月分は訪問月、期首○か月目は決算月から判定します。";
  } else {
    $("#auditMonthTitle").textContent = `${data.label}・所長指示事項`;
    $("#auditMonthDescription").textContent = `毎月項目＋${$("#visitMonth").value || "-"}月分${index ? `＋期首${index}か月目` : ""}を表示しています。`;
  }

  $("#instructionList").innerHTML = instructions.length
    ? instructions.map((item) => `
        <article class="instruction-card">
          <header>
            <strong>${escapeHtml(item.title)}</strong>
            <span class="source-pill">${escapeHtml(item.scope || item.source)}</span>
          </header>
          ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ""}
        </article>
      `).join("")
    : `<article class="instruction-card"><strong>該当指示なし</strong><p>PDF原本を確認し、必要な内容を面談メモへ追加してください。</p></article>`;
}

function renderCandidates() {
  const instructions = currentInstructions();
  const previous = { ...restoredCandidates, ...selectedCandidateMap() };
  Object.keys(categoryLabels).forEach((category) => {
    const instructionCandidates = instructions
      .filter((item) => item.category === category)
      .map((item) => candidate(item.title, item.detail, "所長指示"));
    const dataCandidates = category === "present"
      ? monthlyAnalysis.suggestions.map((item) => candidate(item.title, item.detail, "月次データ"))
      : [];
    const candidates = [...instructionCandidates, ...dataCandidates, ...baseCandidates[category]];
    const container = $(`#${category}Candidates`);
    container.innerHTML = "";
    candidates.forEach((item, index) => {
      const id = `${category}-${item.source}-${item.title}`.replace(/\s+/g, "-");
      container.appendChild(createCandidateCard(category, item, id, previous[id], index));
    });
  });
}

function createCandidateCard(category, item, id, previous, index) {
  const node = $("#candidateTemplate").content.firstElementChild.cloneNode(true);
  const checkbox = $("input[type='checkbox']", node);
  const title = $(".candidate-title", node);
  const source = $(".candidate-source", node);
  const textarea = $("textarea", node);

  node.dataset.category = category;
  node.dataset.id = id;
  node.dataset.title = item.title;
  node.dataset.detail = item.detail;
  node.dataset.source = item.source;
  title.textContent = item.title;
  source.textContent = item.detail ? `${item.source}：${item.detail}` : item.source;
  textarea.value = previous?.note || "";
  const hasPrevious = Boolean(previous);
  checkbox.checked = hasPrevious ? Boolean(previous.checked) : Boolean((item.source === "所長指示" || item.source === "月次データ") && index < 5);
  node.classList.toggle("is-selected", checkbox.checked || Boolean(textarea.value.trim()));

  checkbox.addEventListener("change", () => {
    node.classList.toggle("is-selected", checkbox.checked);
    saveDraft();
    renderSummaries();
    renderStatus();
  });

  textarea.addEventListener("input", () => {
    if (textarea.value.trim()) {
      checkbox.checked = true;
      node.classList.add("is-selected");
    }
    saveDraft();
    renderSummaries();
    renderStatus();
  });

  return node;
}

function selectedCandidateMap() {
  const map = {};
  $$(".candidate-card").forEach((card) => {
    map[card.dataset.id] = {
      checked: $("input[type='checkbox']", card).checked,
      note: $("textarea", card).value
    };
  });
  return map;
}

function selectedTopics() {
  return $$(".candidate-card").flatMap((card) => {
    const checked = $("input[type='checkbox']", card).checked;
    const note = $("textarea", card).value.trim();
    if (!checked && !note) return [];
    return [{
      category: card.dataset.category,
      title: card.dataset.title,
      detail: card.dataset.detail,
      source: card.dataset.source,
      note
    }];
  });
}

function groupedTopics() {
  const topics = selectedTopics();
  return {
    past: topics.filter((topic) => topic.category === "past"),
    present: topics.filter((topic) => topic.category === "present"),
    future: topics.filter((topic) => topic.category === "future")
  };
}

function renderSummaries() {
  const state = readState();
  const grouped = groupedTopics();
  $("#clientSummaryText").textContent = createClientSummary(state, grouped);
  renderClientAgenda(state, grouped);
  $("#detailedSummaryText").textContent = createDetailedSummary(state, grouped);
}

function createClientSummary(state, grouped) {
  const agenda = createClientAgendaModel(state, grouped);
  return [
    agenda.title,
    "",
    "本日の面談テーマ",
    ...agenda.sections.flatMap((section) => [
      `【${section.heading}】`,
      ...section.items.map((item) => item.detail ? `・${item.title}\n  ${item.detail}` : `・${item.title}`)
    ]),
    "",
    "次回までの確認事項",
    ...agenda.homework.map((line) => `・${line}`)
  ].join("\n");
}

function createClientAgendaModel(state, grouped) {
  const client = state.clientName || "お客様";
  const aim = state.meetingAim || "月次巡回監査の結果確認と今後の対応整理";
  const sections = ["past", "present", "future"].map((category) => ({
    category,
    heading: categoryHeadings[category],
    lead: categoryLead(category),
    items: clientAgendaItems(category, grouped[category], state[`${category}Manual`])
  }));
  const homework = state.homework
    ? splitLines(state.homework)
    : defaultHomework(grouped).map((line) => line.replace(/^・/, ""));

  return {
    title: `${client}様 面談テーマ`,
    aim,
    sections,
    homework
  };
}

function categoryLead(category) {
  return {
    past: "前回からの変化と宿題を確認し、今日の前提をそろえます。",
    present: "月次数値と監査確認事項を整理し、今の状態を共有します。",
    future: "決算・納税・資金繰りを見据え、次の判断事項を確認します。"
  }[category];
}

function clientAgendaItems(category, topics, manual) {
  const items = topics.map((topic) => ({
    title: topic.title,
    detail: topic.note || topic.detail
  }));
  splitLines(manual).forEach((line) => {
    items.push({ title: "追加確認テーマ", detail: line });
  });
  if (!items.length) {
    items.push({ title: "通常確認", detail: "今回は大きな追加確認事項はありません。" });
  }
  return items;
}

function renderClientAgenda(state, grouped) {
  const agenda = createClientAgendaModel(state, grouped);
  $("#clientAgendaView").innerHTML = `
    <section class="agenda-paper">
      <header class="agenda-hero">
        <p>月次巡回監査</p>
        <h2>${escapeHtml(agenda.title)}</h2>
      </header>
      <section class="agenda-purpose">
        <h3>本日の進め方</h3>
        <p>${escapeHtml(agenda.aim)}</p>
      </section>
      <section class="agenda-theme-list">
        ${agenda.sections.map((section) => `
          <article class="agenda-theme agenda-theme--${section.category}">
            <h3>${escapeHtml(section.heading)}</h3>
            <p class="agenda-lead">${escapeHtml(section.lead)}</p>
            <ol>
              ${section.items.map((item) => `
                <li>
                  <strong>${escapeHtml(item.title)}</strong>
                  ${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ""}
                </li>
              `).join("")}
            </ol>
          </article>
        `).join("")}
      </section>
      <section class="agenda-homework">
        <h3>次回までの確認事項</h3>
        <ul>
          ${agenda.homework.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
        </ul>
      </section>
    </section>
  `;
}

function defaultHomework(grouped) {
  const source = grouped.future.length ? grouped.future : [...grouped.present, ...grouped.past].slice(0, 3);
  if (!source.length) return ["・次回面談までに、必要な数字・資料・確認事項を整理します。"];
  return source.slice(0, 3).map((topic) => `・${topic.title}について、判断に必要な資料・担当・期限を確認します。`);
}

async function handleCsvImport(kind, file) {
  if (!file) return;
  try {
    const text = await readCsvText(file);
    const rows = parseCsv(text).filter((row) => row.some((cell) => String(cell).trim()));
    monthlyAnalysis[kind] = kind === "balance" ? analyzeBalanceCsv(rows, file.name) : analyzeProfitCsv(rows, file.name);
    renderAll();
    saveDraft();
  } catch (error) {
    window.alert(`CSVを読み込めませんでした: ${error.message}`);
  }
}

async function readCsvText(file) {
  const buffer = await file.arrayBuffer();
  const encodings = ["utf-8", "shift-jis"];
  for (const encoding of encodings) {
    try {
      return new TextDecoder(encoding, { fatal: true }).decode(buffer).replace(/^\uFEFF/, "");
    } catch {
      // try next encoding
    }
  }
  return new TextDecoder("utf-8").decode(buffer).replace(/^\uFEFF/, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === "\"" && next === "\"") {
        field += "\"";
        index += 1;
      } else if (char === "\"") {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  row.push(field);
  rows.push(row);
  return rows;
}

function analyzeProfitCsv(rows, fileName) {
  const body = rows.slice(1);
  const rowByName = (name) => body.find((row) => row[0] === name) || null;
  const metric = (name) => {
    const row = rowByName(name);
    if (!row) return null;
    return {
      name,
      monthActual: toNumber(row[1]),
      monthShare: toNumber(row[2]),
      monthPlan: toNumber(row[3]),
      monthPlanRate: toNumber(row[5]),
      monthLastYear: toNumber(row[6]),
      monthYoY: toNumber(row[8]),
      termActual: toNumber(row[9]),
      termShare: toNumber(row[10]),
      termPlan: toNumber(row[11]),
      termPlanRate: toNumber(row[13]),
      termLastYear: toNumber(row[14]),
      termYoY: toNumber(row[16])
    };
  };

  const metrics = [
    "純売上高",
    "変動費合計",
    "限界利益",
    "人件費",
    "部門固定費計",
    "部門達成利益",
    "設備費",
    "部門貢献利益",
    "経常利益"
  ].map(metric).filter(Boolean);

  const byName = Object.fromEntries(metrics.map((item) => [item.name, item]));
  const suggestions = [];
  const sales = byName["純売上高"];
  const marginal = byName["限界利益"];
  const labor = byName["人件費"];
  const contribution = byName["部門貢献利益"] || byName["部門達成利益"];
  const equipment = byName["設備費"];

  if (sales) {
    suggestions.push({
      title: "売上の計画比・前年比",
      detail: `当月売上は${formatMoney(sales.monthActual)}、計画比${formatRate(sales.monthPlanRate)}、前年比${formatRate(sales.monthYoY)}です。計画差と前年差の要因を確認します。`
    });
  }
  if (marginal) {
    suggestions.push({
      title: "限界利益率の確認",
      detail: `当月の限界利益は${formatMoney(marginal.monthActual)}、限界利益率は${formatPercent(marginal.monthShare)}、計画比${formatRate(marginal.monthPlanRate)}です。売上より粗利側に課題がないか確認します。`
    });
  }
  if (labor && labor.monthPlanRate && labor.monthPlanRate >= 110) {
    suggestions.push({
      title: "人件費が計画を上回っています",
      detail: `当月人件費は${formatMoney(labor.monthActual)}、計画比${formatRate(labor.monthPlanRate)}です。残業・賞与・採用・外注との関係を確認します。`
    });
  }
  if (equipment && equipment.monthPlanRate && equipment.monthPlanRate >= 150) {
    suggestions.push({
      title: "設備費の増加要因",
      detail: `当月設備費は${formatMoney(equipment.monthActual)}、計画比${formatRate(equipment.monthPlanRate)}です。一時費用か継続費用か確認します。`
    });
  }
  if (contribution) {
    suggestions.push({
      title: "利益着地の見通し",
      detail: `当月の貢献利益は${formatMoney(contribution.monthActual)}、計画比${formatRate(contribution.monthPlanRate)}です。当期累計では${formatMoney(contribution.termActual)}です。決算着地への影響を確認します。`
    });
  }

  return { fileName, metrics, suggestions };
}

function analyzeBalanceCsv(rows, fileName) {
  const header = rows[0] || [];
  const monthIndexes = header
    .map((value, index) => ({ value, index }))
    .filter((cell) => /^\d{4}\/\d{2}$/.test(cell.value));
  const latest = monthIndexes[monthIndexes.length - 1];
  const previous = monthIndexes[monthIndexes.length - 2];
  const body = rows.slice(1);

  const accounts = body.map((row) => ({
    code: row[0],
    name: row[1],
    latest: latest ? toNumber(row[latest.index]) : null,
    previous: previous ? toNumber(row[previous.index]) : null,
    ratio: latest ? toNumber(row[latest.index + 1]) : null
  })).filter((row) => row.name && Number.isFinite(row.latest));

  const find = (name) => accounts.find((row) => row.name === name || row.name.includes(name));
  const cash = find("現預金小計");
  const ar = find("売掛金");
  const inventory = find("棚卸資産計");
  const changes = accounts
    .filter((row) => Number.isFinite(row.previous))
    .map((row) => ({ ...row, change: row.latest - row.previous }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);

  const suggestions = [];
  if (cash) {
    suggestions.push({
      title: "現預金残高の推移",
      detail: `${latest?.value || "当月"}の現預金小計は${formatMoney(cash.latest)}、前月差${formatSignedMoney(cash.latest - cash.previous)}です。近い支払いと資金余力を確認します。`
    });
  }
  if (ar) {
    suggestions.push({
      title: "売掛金残高の確認",
      detail: `${latest?.value || "当月"}の売掛金は${formatMoney(ar.latest)}、前月差${formatSignedMoney(ar.latest - ar.previous)}、比率${formatRate(ar.ratio)}です。回収予定と滞留の有無を確認します。`
    });
  }
  if (inventory) {
    suggestions.push({
      title: "棚卸資産の増減確認",
      detail: `${latest?.value || "当月"}の棚卸資産計は${formatMoney(inventory.latest)}、前月差${formatSignedMoney(inventory.latest - inventory.previous)}です。実地棚卸・滞留在庫を確認します。`
    });
  }
  if (changes.length) {
    suggestions.push({
      title: "残高変動が大きい科目",
      detail: changes.map((row) => `${row.name} ${formatSignedMoney(row.change)}`).join("、") + "。大きな増減の理由を確認します。"
    });
  }

  return {
    fileName,
    latestMonth: latest?.value || "",
    previousMonth: previous?.value || "",
    accounts,
    focus: { cash, ar, inventory, changes },
    suggestions
  };
}

function refreshMonthlySuggestions() {
  monthlyAnalysis.suggestions = [
    ...(monthlyAnalysis.profit?.suggestions || []),
    ...(monthlyAnalysis.balance?.suggestions || [])
  ];
  renderMonthlySuggestionList();
  $("#profitImportStatus").textContent = monthlyAnalysis.profit ? monthlyAnalysis.profit.fileName : "未取込";
  $("#balanceImportStatus").textContent = monthlyAnalysis.balance ? monthlyAnalysis.balance.fileName : "未取込";
}

function renderMonthlySuggestionList() {
  const list = $("#monthlySuggestionList");
  if (!monthlyAnalysis.suggestions.length) {
    list.innerHTML = `<p class="empty-note">CSVを取り込むと、伝えるべきポイントを自動で表示します。</p>`;
    return;
  }
  list.innerHTML = monthlyAnalysis.suggestions.map((item) => `
    <article class="monthly-suggestion-card">
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.detail)}</p>
    </article>
  `).join("");
}

function renderMonthlyReport() {
  const text = createMonthlyReportText();
  $("#monthlyReportText").textContent = text;
  $("#monthlyReportView").innerHTML = createMonthlyReportHtml();
}

function createMonthlyReportText() {
  if (!monthlyAnalysis.profit && !monthlyAnalysis.balance) {
    return "CSVを取り込むと、月次レポートを自動作成します。";
  }
  return [
    "月次レポート",
    "",
    "1. 伝えるべきポイント",
    ...monthlyAnalysis.suggestions.map((item) => `・${item.title}：${item.detail}`),
    "",
    "2. 主要数値",
    ...reportMetricLines()
  ].join("\n");
}

function createMonthlyReportHtml() {
  if (!monthlyAnalysis.profit && !monthlyAnalysis.balance) {
    return `<p class="empty-note">CSVを取り込むと、月次レポートを自動作成します。</p>`;
  }
  return `
    <section class="report-paper">
      <header class="report-hero">
        <p>Monthly Report</p>
        <h3>月次巡回監査レポート</h3>
      </header>
      <section class="report-section">
        <h4>伝えるべきポイント</h4>
        <div class="report-point-list">
          ${monthlyAnalysis.suggestions.map((item) => `
            <article>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.detail)}</p>
            </article>
          `).join("")}
        </div>
      </section>
      <section class="report-section">
        <h4>主要数値</h4>
        <div class="report-kpi-grid">
          ${reportMetricCards().map((card) => `
            <article>
              <span>${escapeHtml(card.label)}</span>
              <strong>${escapeHtml(card.value)}</strong>
              <p>${escapeHtml(card.note)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    </section>
  `;
}

function reportMetricCards() {
  const cards = [];
  const profit = monthlyAnalysis.profit;
  const balance = monthlyAnalysis.balance;
  const byName = profit ? Object.fromEntries(profit.metrics.map((item) => [item.name, item])) : {};
  if (byName["純売上高"]) cards.push({ label: "当月売上", value: formatMoney(byName["純売上高"].monthActual), note: `計画比 ${formatRate(byName["純売上高"].monthPlanRate)} / 前年比 ${formatRate(byName["純売上高"].monthYoY)}` });
  if (byName["限界利益"]) cards.push({ label: "限界利益率", value: formatPercent(byName["限界利益"].monthShare), note: `限界利益 ${formatMoney(byName["限界利益"].monthActual)}` });
  if (byName["部門貢献利益"]) cards.push({ label: "部門貢献利益", value: formatMoney(byName["部門貢献利益"].monthActual), note: `計画比 ${formatRate(byName["部門貢献利益"].monthPlanRate)}` });
  if (balance?.focus.cash) cards.push({ label: "現預金小計", value: formatMoney(balance.focus.cash.latest), note: `前月差 ${formatSignedMoney(balance.focus.cash.latest - balance.focus.cash.previous)}` });
  if (balance?.focus.ar) cards.push({ label: "売掛金", value: formatMoney(balance.focus.ar.latest), note: `前月差 ${formatSignedMoney(balance.focus.ar.latest - balance.focus.ar.previous)}` });
  if (balance?.focus.inventory) cards.push({ label: "棚卸資産計", value: formatMoney(balance.focus.inventory.latest), note: `前月差 ${formatSignedMoney(balance.focus.inventory.latest - balance.focus.inventory.previous)}` });
  return cards;
}

function reportMetricLines() {
  return reportMetricCards().map((card) => `・${card.label}：${card.value}（${card.note}）`);
}

function createDetailedSummary(state, grouped) {
  const index = auditMonthIndex();
  const instructions = currentInstructions();
  return [
    "月次巡回監査 詳細版カンニングペーパー",
    "",
    `対象：${state.clientName || "未入力"} / ${instructionData[state.entityType].label}`,
    `決算月：${state.fiscalMonth || "-"}月、訪問月：${state.visitMonth || "-"}月、巡回${index || "-"}か月目`,
    `PDF：${instructionData[state.entityType].pdf}`,
    "",
    "【所長指示 該当項目】",
    ...(instructions.length ? instructions.map((item) => item.detail ? `・${item.title}：${item.detail}` : `・${item.title}`) : ["・該当月の指示事項をPDF原本で確認してください。"]),
    "",
    "【月次データ サジェスト】",
    ...(monthlyAnalysis.suggestions.length ? monthlyAnalysis.suggestions.map((item) => `・${item.title}：${item.detail}`) : ["・月次CSVを取り込むと、数値から伝えるべきポイントを表示します。"]),
    "",
    "【面談の進め方】",
    "1. 前回宿題と前月からの変化を確認する。",
    "2. 月次数値、資金、税務手続、所長指示の該当事項を確認する。",
    "3. 決算・納税・次回までの宿題へつなげる。",
    "",
    ...detailedTopicBlock("past", grouped.past, state.pastManual),
    "",
    ...detailedTopicBlock("present", grouped.present, state.presentManual),
    "",
    ...detailedTopicBlock("future", grouped.future, state.futureManual),
    "",
    "【面談結果】",
    `決まったこと：${state.decisions || "未入力"}`,
    `宿題：${state.homework || "未入力"}`,
    `振り返り：${state.reflection || "未入力"}`
  ].join("\n");
}

function detailedTopicBlock(category, topics, manual) {
  const lines = [`【${categoryHeadings[category]}】`];
  if (!topics.length && !manual.trim()) {
    lines.push("・未選択");
    return lines;
  }
  topics.forEach((topic) => {
    lines.push(`・${topic.title}（${topic.source}）`);
    if (topic.detail) lines.push(`  確認観点：${topic.detail}`);
    lines.push(`  面談メモ：${topic.note || "未入力"}`);
  });
  splitLines(manual).forEach((line) => lines.push(`・追加メモ：${line}`));
  return lines;
}

function renderStatus() {
  const state = readState();
  const index = auditMonthIndex();
  $("#statusEntity").textContent = state.clientName || instructionData[state.entityType].label;
  $("#statusAuditMonth").textContent = index ? `${index}か月目` : "-";
  $("#statusInstructionCount").textContent = `${currentInstructions().length}件`;
  $("#statusTopicCount").textContent = `${selectedTopics().length}件`;
}

function saveDraft() {
  const draft = {
    form: readState(),
    candidates: selectedCandidateMap(),
    monthlyAnalysis
  };
  localStorage.setItem(draftKey, JSON.stringify(draft));
}

function restoreDraft() {
  const raw = localStorage.getItem(draftKey);
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    restoredCandidates = draft.candidates || {};
    if (draft.monthlyAnalysis) monthlyAnalysis = draft.monthlyAnalysis;
    Object.entries(draft.form || {}).forEach(([id, value]) => {
      if ($(`#${id}`)) $(`#${id}`).value = value;
    });
  } catch {
    localStorage.removeItem(draftKey);
  }
}

function saveRecord() {
  const state = readState();
  const record = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    savedAt: new Date().toISOString(),
    clientName: state.clientName || "未入力",
    visitDate: state.visitDate || "",
    auditMonth: auditMonthIndex(),
    detailed: $("#detailedSummaryText").textContent,
    client: $("#clientSummaryText").textContent,
    decisions: state.decisions,
    homework: state.homework,
    reflection: state.reflection
  };
  const records = loadRecords();
  records.unshift(record);
  localStorage.setItem(recordKey, JSON.stringify(records.slice(0, 20)));
  renderRecords();
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(recordKey) || "[]");
  } catch {
    return [];
  }
}

function renderRecords() {
  const records = loadRecords();
  $("#recordList").innerHTML = records.length
    ? records.map((record) => `
      <article class="record-card">
        <div>
          <strong>${escapeHtml(record.clientName)}</strong>
          <p>${escapeHtml(record.visitDate || "日付未設定")} / 巡回${record.auditMonth || "-"}か月目 / ${new Date(record.savedAt).toLocaleString("ja-JP")}</p>
        </div>
        <button class="button button--subtle" type="button" data-load-record="${escapeHtml(record.id)}">読込</button>
      </article>
    `).join("")
    : `<article class="record-card"><div><strong>保存履歴はまだありません</strong><p>面談後に宿題や振り返りを入力して保存できます。</p></div></article>`;

  $$("[data-load-record]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = loadRecords().find((item) => item.id === button.dataset.loadRecord);
      if (!record) return;
      $("#clientSummaryText").textContent = record.client;
      $("#detailedSummaryText").textContent = record.detailed;
      $("#decisions").value = record.decisions || "";
      $("#homework").value = record.homework || "";
      $("#reflection").value = record.reflection || "";
    });
  });
}

async function copyText(selector, buttonSelector, originalLabel) {
  try {
    await navigator.clipboard.writeText($(selector).textContent);
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
  renderSummaries();
  document.body.classList.add("print-client-summary");
  const cleanup = () => {
    document.body.classList.remove("print-client-summary");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  window.setTimeout(cleanup, 1200);
}

function printDetailedSummary() {
  renderSummaries();
  document.body.classList.add("print-detailed-summary");
  const cleanup = () => {
    document.body.classList.remove("print-detailed-summary");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  window.setTimeout(cleanup, 1200);
}

function printMonthlyReport() {
  renderMonthlyReport();
  document.body.classList.add("print-monthly-report");
  const cleanup = () => {
    document.body.classList.remove("print-monthly-report");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  window.setTimeout(cleanup, 1200);
}

function loadSample() {
  $("#entityType").value = "corporate";
  $("#clientName").value = "株式会社サンプル製作所";
  $("#fiscalMonth").value = "3";
  $("#visitMonth").value = "6";
  $("#participants").value = "社長、経理担当、松本会計";
  $("#meetingAim").value = "第1四半期の月次着地、資金繰り、所長指示事項の確認";
  $("#pastManual").value = "前回依頼した売掛金回収予定表の更新状況を確認する。";
  $("#presentManual").value = "粗利率が前月比で低下しているため、材料費と外注費の増減を確認する。";
  $("#futureManual").value = "夏季賞与と納税予定を踏まえ、8月までの資金繰りを確認する。";
  $("#decisions").value = "6月中に資金繰り予定表を更新し、次回面談で納税見込みを再確認する。";
  $("#homework").value = "社長：売掛金回収予定を確認\n松本会計：中間申告の要否と納付見込みを整理";
  $("#reflection").value = "採用の話題が広がりやすいため、次回は資金繰りと人員計画を分けて確認する。";
  renderAll();
  saveDraft();
}

function clearDraft() {
  if (!window.confirm("入力内容を初期化しますか。")) return;
  formIds.forEach((id) => {
    if (id === "entityType") {
      $(`#${id}`).value = "corporate";
    } else {
      $(`#${id}`).value = "";
    }
  });
  setDefaultDate();
  localStorage.removeItem(draftKey);
  restoredCandidates = {};
  monthlyAnalysis = { balance: null, profit: null, suggestions: [] };
  renderAll();
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).replace(/,/g, "").replace(/△/g, "-").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return "-";
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

function formatSignedMoney(value) {
  if (!Number.isFinite(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${Math.round(value).toLocaleString("ja-JP")}円`;
}

function formatRate(value) {
  if (!Number.isFinite(value)) return "-";
  return `${roundOne(value)}%`;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "-";
  return `${roundOne(value)}%`;
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function splitLines(value) {
  return value.split(/\n+/).map((line) => line.trim()).filter(Boolean);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

init();
