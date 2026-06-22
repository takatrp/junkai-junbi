"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "../src/supabaseClient";
import {
  CATEGORY_VALUES,
  baseCandidates,
  buildClientFacingItems,
  buildClientFacingOutput,
  buildExportFileName,
  buildExportJson,
  buildInternalOutput,
  buildStockSummary,
  categoryLabels,
  checklistItems,
  createAgendaItem,
  filterCarryForwardItems,
  formatJapaneseMonth,
  getChecklistState,
  getPreviousTargetMonth,
  groupItems,
  hasDueDatedOpenItems,
  moveItemWithinCategory,
  toDbItem
} from "../src/domain.mjs";

const supabase = createSupabaseBrowserClient();
const appMeta = {
  officeName: "松本会計事務所",
  lastUpdated: "2026-06-19",
  releaseNo: "R003"
};

const emptyMeeting = {
  target_month: "",
  meeting_date: "",
  staff_name: "",
  participants: "",
  meeting_aim: "",
  decisions: "",
  client_homework: "",
  office_homework: "",
  stock_summary: "",
  post_checklist: {}
};

const emptyNewItem = {
  title: "",
  detail: "",
  owner: "",
  due_date: "",
  status: "open",
  carry_forward: true,
  visibility: "client"
};

function getAuthRedirectUrl() {
  const fallbackUrl = "https://takatrp.github.io/junkai-junbi/";
  if (typeof window === "undefined") return fallbackUrl;

  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";

  if (url.hostname === "takatrp.github.io") {
    url.pathname = "/junkai-junbi/";
  } else if (!url.pathname) {
    url.pathname = "/";
  }

  return url.toString();
}

export default function Page() {
  const configured = hasSupabaseConfig();
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientDraft, setClientDraft] = useState({ code: "", name: "" });
  const [meetings, setMeetings] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const [items, setItems] = useState([]);
  const [internalNotes, setInternalNotes] = useState([]);
  const [targetMonthDraft, setTargetMonthDraft] = useState("");
  const [newItems, setNewItems] = useState({
    previous: { ...emptyNewItem },
    current: { ...emptyNewItem },
    next: { ...emptyNewItem }
  });
  const [newNote, setNewNote] = useState({ title: "", detail: "" });
  const [printDocument, setPrintDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedClient = clients.find((client) => client.id === selectedClientId) || null;
  const carryForwardItems = useMemo(() => items.filter((item) => item.source === "carry_forward"), [items]);
  const grouped = useMemo(() => groupItems(items.filter((item) => item.source !== "carry_forward")), [items]);
  const clientAgendaItems = useMemo(() => buildClientFacingItems(items), [items]);
  const clientOutput = useMemo(() => buildClientFacingOutput({ client: selectedClient, meeting, items }), [selectedClient, meeting, items]);
  const internalOutput = useMemo(() => buildInternalOutput({ client: selectedClient, meeting, items, internalNotes }), [selectedClient, meeting, items, internalNotes]);
  const summaryText = useMemo(() => meeting ? buildStockSummary({
    ...meeting,
    client_code: selectedClient?.code || "",
    client_name: selectedClient?.name || "",
    items,
    internalNotes
  }) : "", [meeting, selectedClient, items, internalNotes]);
  const dueOpenItems = hasDueDatedOpenItems(items);
  const checklistState = getChecklistState(meeting?.post_checklist || {});

  useEffect(() => {
    if (!configured || !supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, [configured]);

  useEffect(() => {
    if (!session) return;
    loadClients();
  }, [session]);

  useEffect(() => {
    if (!selectedClientId) return;
    loadMeetings(selectedClientId);
    setMeeting(null);
    setItems([]);
    setInternalNotes([]);
  }, [selectedClientId]);

  useEffect(() => {
    if (!printDocument) return undefined;
    const timer = window.setTimeout(() => window.print(), 80);
    const clearPrintDocument = () => setPrintDocument(null);
    window.addEventListener("afterprint", clearPrintDocument, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", clearPrintDocument);
    };
  }, [printDocument]);

  async function signIn(event) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getAuthRedirectUrl() }
    });
    setLoading(false);
    setMessage(error ? error.message : "確認メールを送信しました。メール内のリンクからログインしてください。");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setMeeting(null);
    setItems([]);
    setInternalNotes([]);
  }

  async function loadClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("code", { ascending: true });
    setLoading(false);
    if (error) return setMessage(error.message);
    setClients(data || []);
  }

  async function createClientRecord(event) {
    event.preventDefault();
    if (!clientDraft.code.trim()) return setMessage("顧客コードを入力してください。");
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .insert({
        code: clientDraft.code.trim(),
        name: clientDraft.name.trim()
      })
      .select()
      .single();
    setLoading(false);
    if (error) return setMessage(error.message);
    setClients((prev) => [...prev, data].sort((a, b) => a.code.localeCompare(b.code)));
    setSelectedClientId(data.id);
    setClientDraft({ code: "", name: "" });
    setMessage("顧客を登録しました。");
  }

  async function loadMeetings(clientId) {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("client_id", clientId)
      .order("target_month", { ascending: false });
    if (error) return setMessage(error.message);
    setMeetings(data || []);
  }

  async function createMeetingRecord(event) {
    event.preventDefault();
    if (!selectedClientId) return setMessage("顧客を選択してください。");
    if (!targetMonthDraft) return setMessage("対象月を入力してください。");
    setLoading(true);

    const existing = meetings.find((entry) => entry.target_month === targetMonthDraft);
    if (existing) {
      await openMeeting(existing);
      setLoading(false);
      return;
    }

    const { data: created, error } = await supabase
      .from("meetings")
      .insert({
        client_id: selectedClientId,
        target_month: targetMonthDraft,
        meeting_date: new Date().toISOString().slice(0, 10),
        post_checklist: {}
      })
      .select()
      .single();

    if (error) {
      setLoading(false);
      return setMessage(error.message);
    }

    const previousItems = await loadPreviousCarryForwardItems(selectedClientId, targetMonthDraft);
    const seeded = [
      ...previousItems.map((item, index) => ({
        ...toDbItem({
          ...item,
          category: "previous",
          source: "carry_forward",
          source_item_id: item.id,
          sort_order: index
        }, created.id, index),
        title: item.title,
        detail: item.detail
      })),
      ...CATEGORY_VALUES.flatMap((category) => baseCandidates[category].map(([title, detail], index) => toDbItem({
        title,
        detail,
        category,
        source: "template",
        sort_order: previousItems.length + index
      }, created.id, previousItems.length + index)))
    ];

    if (seeded.length) {
      const { error: seedError } = await supabase.from("agenda_items").insert(seeded);
      if (seedError) setMessage(seedError.message);
    }

    await loadMeetings(selectedClientId);
    await openMeeting(created);
    setTargetMonthDraft("");
    setLoading(false);
    setMessage("面談を作成し、前月の未完了事項を自動繰越しました。");
  }

  async function loadPreviousCarryForwardItems(clientId, targetMonth) {
    const previousMonth = getPreviousTargetMonth(targetMonth);
    if (!previousMonth) return [];
    const { data: previousMeeting } = await supabase
      .from("meetings")
      .select("id")
      .eq("client_id", clientId)
      .eq("target_month", previousMonth)
      .maybeSingle();
    if (!previousMeeting?.id) return [];
    const { data } = await supabase
      .from("agenda_items")
      .select("*")
      .eq("meeting_id", previousMeeting.id)
      .order("sort_order", { ascending: true });
    return filterCarryForwardItems(data || []);
  }

  async function openMeeting(nextMeeting) {
    setMeeting({ ...emptyMeeting, ...nextMeeting, post_checklist: nextMeeting.post_checklist || {} });
    const [{ data: itemData, error: itemError }, { data: noteData, error: noteError }] = await Promise.all([
      supabase.from("agenda_items").select("*").eq("meeting_id", nextMeeting.id).order("sort_order", { ascending: true }),
      supabase.from("internal_notes").select("*").eq("meeting_id", nextMeeting.id).order("created_at", { ascending: true })
    ]);
    if (itemError || noteError) setMessage(itemError?.message || noteError?.message);
    setItems(itemData || []);
    setInternalNotes(noteData || []);
  }

  async function saveMeeting(updates = {}) {
    if (!meeting) return;
    const payload = { ...meeting, ...updates };
    setMeeting(payload);
    const { id, created_at, created_by, updated_at, ...saveable } = payload;
    const { data, error } = await supabase
      .from("meetings")
      .update(saveable)
      .eq("id", meeting.id)
      .select()
      .single();
    if (error) return setMessage(error.message);
    setMeeting({ ...emptyMeeting, ...data, post_checklist: data.post_checklist || {} });
    setMeetings((prev) => prev.map((entry) => entry.id === data.id ? data : entry));
  }

  async function updateItem(itemId, updates) {
    const current = items.find((item) => item.id === itemId);
    if (!current) return;
    const next = updates.status ? { ...current, ...updates, ...createAgendaItem({ ...current, ...updates }) } : { ...current, ...updates };
    setItems((prev) => prev.map((item) => item.id === itemId ? next : item));
    const { id, created_at, created_by, updated_at, ...saveable } = next;
    const { error } = await supabase.from("agenda_items").update(saveable).eq("id", itemId);
    if (error) setMessage(error.message);
  }

  async function addItem(category) {
    if (!meeting) return;
    const draft = newItems[category];
    if (!draft.title.trim()) return setMessage("タイトルを入力してください。");
    const sortOrder = items.filter((item) => item.category === category).length;
    const insertable = toDbItem({ ...draft, category, sort_order: sortOrder }, meeting.id, sortOrder);
    const { data, error } = await supabase.from("agenda_items").insert(insertable).select().single();
    if (error) return setMessage(error.message);
    setItems((prev) => [...prev, data]);
    setNewItems((prev) => ({ ...prev, [category]: { ...emptyNewItem } }));
  }

  async function deleteItem(itemId) {
    const { error } = await supabase.from("agenda_items").delete().eq("id", itemId);
    if (error) return setMessage(error.message);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function moveItem(itemId, direction) {
    const moved = moveItemWithinCategory(items, itemId, direction);
    setItems(moved);
    await Promise.all(moved.map((item, sortOrder) => (
      supabase.from("agenda_items").update({ sort_order: sortOrder }).eq("id", item.id)
    )));
  }

  async function addInternalNote() {
    if (!meeting) return;
    if (!newNote.title.trim()) return setMessage("内部メモの見出しを入力してください。");
    const { data, error } = await supabase
      .from("internal_notes")
      .insert({ meeting_id: meeting.id, title: newNote.title.trim(), detail: newNote.detail.trim() })
      .select()
      .single();
    if (error) return setMessage(error.message);
    setInternalNotes((prev) => [...prev, data]);
    setNewNote({ title: "", detail: "" });
  }

  async function saveStockSummary() {
    await saveMeeting({
      stock_summary: summaryText,
      stock_summary_generated_at: new Date().toISOString()
    });
    await copyText(summaryText);
    setMessage("Stock貼付用要約を保存し、コピーしました。");
  }

  async function toggleChecklist(id, checked) {
    if (!meeting) return;
    const post_checklist = { ...(meeting.post_checklist || {}), [id]: checked };
    await saveMeeting({ post_checklist });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("コピーしました。");
    } catch {
      setMessage("コピーに失敗しました。画面上のテキストを手動でコピーしてください。");
    }
  }

  function downloadJson() {
    if (!meeting || !selectedClient) return;
    const payload = buildExportJson({
      ...meeting,
      client_code: selectedClient.code,
      client_name: selectedClient.name,
      items,
      internalNotes,
      stock_summary: summaryText
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = buildExportFileName(selectedClient.code, meeting.target_month);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function printOutput(title, text) {
    setPrintDocument({ kind: "text", title, text });
  }

  function printClientAgenda() {
    setPrintDocument({
      kind: "clientAgenda",
      client: selectedClient,
      meeting,
      items: clientAgendaItems
    });
  }

  if (!configured) {
    return <SetupScreen />;
  }

  if (!session) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Supabase Source of Truth</p>
          <h1>月次面談アジェンダ管理</h1>
          <p>職員ログイン後、Supabaseを正本として顧客・面談・繰越事項を管理します。</p>
          <form onSubmit={signIn}>
            <label>
              <span>メールアドレス</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="staff@example.com" required />
            </label>
            <button className="button primary" disabled={loading}>ログインリンクを送信</button>
          </form>
          {message && <p className="message">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Supabase正本</p>
          <h1>月次面談アジェンダ管理</h1>
        </div>
        <div className="header-actions">
          <span>{session.user.email}</span>
          <button className="button subtle" onClick={signOut}>ログアウト</button>
        </div>
      </header>

      {message && <div className="message-bar">{message}</div>}

      <section className="workspace-grid">
        <aside className="side-panel">
          <section className="panel">
            <h2>顧客</h2>
            <form onSubmit={createClientRecord} className="stack">
              <label>
                <span>顧客コード</span>
                <input value={clientDraft.code} onChange={(event) => setClientDraft({ ...clientDraft, code: event.target.value })} placeholder="TEST001" />
              </label>
              <label>
                <span>法人名</span>
                <input value={clientDraft.name} onChange={(event) => setClientDraft({ ...clientDraft, name: event.target.value })} placeholder="サンプル株式会社" />
              </label>
              <button className="button primary">顧客を追加</button>
            </form>
            <div className="list">
              {clients.map((client) => (
                <button key={client.id} className={`list-row ${selectedClientId === client.id ? "active" : ""}`} onClick={() => setSelectedClientId(client.id)}>
                  <strong>{client.code}</strong>
                  <span>{client.name || "名称未設定"}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>面談</h2>
            <form onSubmit={createMeetingRecord} className="inline-form">
              <input type="month" value={targetMonthDraft} onChange={(event) => setTargetMonthDraft(event.target.value)} />
              <button className="button primary" disabled={!selectedClientId}>作成/開く</button>
            </form>
            <div className="list">
              {meetings.map((entry) => (
                <button key={entry.id} className={`list-row ${meeting?.id === entry.id ? "active" : ""}`} onClick={() => openMeeting(entry)}>
                  <strong>{formatJapaneseMonth(entry.target_month)}</strong>
                  <span>{entry.meeting_date || "面談日未定"}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="main-panel">
          {!meeting ? (
            <EmptyState selectedClient={selectedClient} />
          ) : (
            <>
              <section className="panel">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">{selectedClient?.code}</p>
                    <h2>{selectedClient?.name ? `${selectedClient.name} 様 ` : ""}{formatJapaneseMonth(meeting.target_month)} 月次面談</h2>
                  </div>
                  <button className="button subtle" onClick={() => saveMeeting()}>基本情報を保存</button>
                </div>
                <div className="field-grid">
                  <Field label="面談日" type="date" value={meeting.meeting_date || ""} onChange={(value) => setMeeting({ ...meeting, meeting_date: value })} />
                  <Field label="担当者" value={meeting.staff_name || ""} onChange={(value) => setMeeting({ ...meeting, staff_name: value })} />
                  <Field label="参加者" value={meeting.participants || ""} onChange={(value) => setMeeting({ ...meeting, participants: value })} />
                  <label className="wide">
                    <span>今回の面談で必ず扱うテーマ</span>
                    <textarea value={meeting.meeting_aim || ""} onChange={(event) => setMeeting({ ...meeting, meeting_aim: event.target.value })} rows={3} />
                  </label>
                </div>
              </section>

              <CarryForwardPanel
                items={carryForwardItems}
                onChange={updateItem}
                onDelete={deleteItem}
                onMove={moveItem}
              />

              <section className="panel agenda-panel">
                <div className="section-head compact">
                  <div>
                    <h2>面談テーマ</h2>
                    <p>過去・現在・未来の順に確認します。前月からの繰越事項は上の専用欄に固定表示されます。</p>
                  </div>
                </div>
                {CATEGORY_VALUES.map((category) => (
                  <section key={category} className="category-block">
                    <div className="section-head compact">
                      <div>
                        <h2>{categoryLabels[category]}</h2>
                        <p>{categoryDescription(category)}</p>
                      </div>
                    </div>
                    <div className="cards">
                      {(grouped[category] || []).map((item) => (
                        <AgendaCard
                          key={item.id}
                          item={item}
                          onChange={(updates) => updateItem(item.id, updates)}
                          onDelete={() => deleteItem(item.id)}
                          onMove={(direction) => moveItem(item.id, direction)}
                        />
                      ))}
                    </div>
                    <ItemEntry
                      value={newItems[category]}
                      onChange={(next) => setNewItems((prev) => ({ ...prev, [category]: next }))}
                      onAdd={() => addItem(category)}
                    />
                  </section>
                ))}
              </section>

              <section className="panel">
                <div className="section-head">
                  <h2>面談結果</h2>
                  <button className="button subtle" onClick={() => saveMeeting()}>面談結果を保存</button>
                </div>
                <div className="field-grid">
                  <Area label="決定事項" value={meeting.decisions || ""} onChange={(value) => setMeeting({ ...meeting, decisions: value })} />
                  <Area label="顧客側の宿題" value={meeting.client_homework || ""} onChange={(value) => setMeeting({ ...meeting, client_homework: value })} />
                  <Area label="事務所側の宿題" value={meeting.office_homework || ""} onChange={(value) => setMeeting({ ...meeting, office_homework: value })} />
                </div>
              </section>

              <section className="panel">
                <div className="section-head">
                  <h2>内部メモ</h2>
                  <button className="button primary" onClick={addInternalNote}>内部メモを追加</button>
                </div>
                <div className="field-grid">
                  <Field label="見出し" value={newNote.title} onChange={(value) => setNewNote({ ...newNote, title: value })} />
                  <Area label="内容" value={newNote.detail} onChange={(value) => setNewNote({ ...newNote, detail: value })} />
                </div>
                <div className="note-list">
                  {internalNotes.map((note) => (
                    <article key={note.id} className="note-card">
                      <strong>{note.title}</strong>
                      <p>{note.detail || "詳細なし"}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="output-grid">
                <ClientAgendaBox
                  client={selectedClient}
                  meeting={meeting}
                  items={clientAgendaItems}
                  onCopy={() => copyText(clientOutput)}
                  onPrint={printClientAgenda}
                />
                <OutputBox title="内部用メモ" text={internalOutput} onCopy={() => copyText(internalOutput)} onPrint={() => printOutput("内部用メモ", internalOutput)} />
                <OutputBox title="Stock貼付用要約" text={summaryText} onCopy={saveStockSummary} buttonLabel="保存してコピー" />
              </section>

              <section className="panel">
                <div className="section-head">
                  <div>
                    <h2>完了チェック</h2>
                    <p>{checklistState.complete ? "月次面談フロー完了" : `未完了の手順が${checklistState.uncheckedCount}件あります。`}</p>
                    {dueOpenItems && <p className="warning">期限付きの未完了項目があります。必要に応じてタスク化してください。</p>}
                  </div>
                  <button className="button subtle" onClick={downloadJson}>JSONをエクスポート</button>
                </div>
                <div className="checklist">
                  {checklistItems.map(([id, label]) => (
                    <label key={id} className={id === "task_registered" && dueOpenItems ? "emphasis" : ""}>
                      <input type="checkbox" checked={Boolean(meeting.post_checklist?.[id])} onChange={(event) => toggleChecklist(id, event.target.checked)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </>
          )}
        </section>
      </section>

      <FooterMeta />
      <PrintArea document={printDocument} />
    </main>
  );
}

function FooterMeta() {
  return (
    <footer className="app-footer">
      <span>{appMeta.officeName}</span>
      <span>最終更新日: {appMeta.lastUpdated}</span>
      <span>{appMeta.releaseNo}</span>
    </footer>
  );
}

function SetupScreen() {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Setup required</p>
        <h1>Supabase設定が必要です</h1>
        <p>Vercelの環境変数に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` を設定してください。</p>
        <p>ローカル開発では `.env.example` を `.env.local` にコピーして値を入れます。</p>
      </section>
    </main>
  );
}

function EmptyState({ selectedClient }) {
  return (
    <section className="empty-panel">
      <h2>{selectedClient ? "対象月を作成または選択してください" : "顧客を選択してください"}</h2>
      <p>Supabaseを正本として、前月の未完了事項は対象月作成時に自動で繰り越されます。</p>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label>
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }) {
  return (
    <label className="wide">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} />
    </label>
  );
}

function CarryForwardPanel({ items, onChange, onDelete, onMove }) {
  return (
    <section className="panel carry-forward-panel">
      <div className="section-head compact">
        <div>
          <p className="eyebrow">最優先確認</p>
          <h2>前月からの繰越事項</h2>
          <p>前月の未完了・繰越対象だけを表示します。今回扱わないものは、次月以降へ繰り越すチェックを外します。</p>
        </div>
        <strong className="count-badge">{items.length}件</strong>
      </div>
      {items.length ? (
        <div className="cards">
          {items.map((item) => (
            <AgendaCard
              key={item.id}
              item={item}
              showMove={false}
              onChange={(updates) => onChange(item.id, updates)}
              onDelete={() => onDelete(item.id)}
              onMove={(direction) => onMove(item.id, direction)}
            />
          ))}
        </div>
      ) : (
        <p className="empty-note">前月から自動繰越された事項はありません。</p>
      )}
    </section>
  );
}

function AgendaCard({ item, onChange, onDelete, onMove, showMove = true }) {
  return (
    <article className={`agenda-card ${item.visibility === "internal" ? "internal" : ""}`}>
      <div className="card-actions">
        {showMove && <button className="icon-button" onClick={() => onMove("up")} title="上へ移動">↑</button>}
        {showMove && <button className="icon-button" onClick={() => onMove("down")} title="下へ移動">↓</button>}
        <button className="icon-button danger" onClick={onDelete} title="削除">×</button>
      </div>
      <label className="agenda-title-field">
        <span>見出し</span>
        <input className="title-input" value={item.title} onChange={(event) => onChange({ title: event.target.value })} />
      </label>
      <label className="agenda-detail-field">
        <span>内容</span>
        <textarea value={item.detail || ""} onChange={(event) => onChange({ detail: event.target.value })} rows={3} />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={Boolean(item.carry_forward)} disabled={["done", "withdrawn"].includes(item.status)} onChange={(event) => onChange({ carry_forward: event.target.checked })} />
        <span>次月以降へ繰り越す</span>
      </label>
    </article>
  );
}

function ItemEntry({ value, onChange, onAdd }) {
  return (
    <section className="item-entry">
      <h3>このカテゴリに追加</h3>
      <div className="field-grid">
        <Field label="タイトル" value={value.title} onChange={(next) => onChange({ ...value, title: next })} />
        <Area label="詳細" value={value.detail} onChange={(next) => onChange({ ...value, detail: next })} />
      </div>
      <button className="button primary" onClick={onAdd}>事項を追加</button>
    </section>
  );
}

function ClientAgendaBox({ client, meeting, items, onCopy, onPrint }) {
  return (
    <section className="panel output-box client-agenda-box">
      <div className="section-head compact">
        <div>
          <h2>顧客共有用アジェンダ</h2>
          <p>そのまま印刷して顧客へ渡すための簡潔なアジェンダです。</p>
        </div>
        <div className="output-actions">
          <button className="button subtle" onClick={onCopy}>コピー</button>
          <button className="button primary" onClick={onPrint}>印刷</button>
        </div>
      </div>
      <ClientAgendaDocument client={client} meeting={meeting} items={items} />
    </section>
  );
}

function OutputBox({ title, text, onCopy, onPrint, buttonLabel = "コピー" }) {
  return (
    <section className="panel output-box">
      <div className="section-head compact">
        <h2>{title}</h2>
        <div className="output-actions">
          <button className="button subtle" onClick={onCopy}>{buttonLabel}</button>
          {onPrint && <button className="button subtle" onClick={onPrint}>印刷</button>}
        </div>
      </div>
      <textarea value={text} readOnly rows={18} />
    </section>
  );
}

function PrintArea({ document }) {
  if (!document) return null;
  if (document.kind === "clientAgenda") {
    return (
      <section className="print-area" aria-hidden={!document}>
        <ClientAgendaDocument client={document.client} meeting={document.meeting} items={document.items} printMode />
      </section>
    );
  }
  return (
    <section className="print-area" aria-hidden={!document}>
      <h1>{document.title}</h1>
      <pre>{document.text}</pre>
    </section>
  );
}

function ClientAgendaDocument({ client, meeting, items, printMode = false }) {
  const groups = groupItems(items);
  const hasItems = CATEGORY_VALUES.some((category) => groups[category]?.length);
  return (
    <article className={`client-agenda-document ${printMode ? "is-print" : ""}`}>
      <header className="document-header">
        <div>
          <p className="document-kicker">Monthly Meeting Agenda</p>
          <h1>{client?.name ? `${client.name} 様` : "月次面談アジェンダ"}</h1>
        </div>
        <dl className="document-meta">
          <div>
            <dt>対象月</dt>
            <dd>{formatJapaneseMonth(meeting?.target_month)}</dd>
          </div>
          <div>
            <dt>面談日</dt>
            <dd>{meeting?.meeting_date || "未定"}</dd>
          </div>
        </dl>
      </header>

      {meeting?.meeting_aim && (
        <section className="document-focus">
          <span>重点テーマ</span>
          <p>{meeting.meeting_aim}</p>
        </section>
      )}

      <div className="document-sections">
        {hasItems ? CATEGORY_VALUES.map((category, index) => (
          <section key={category} className="document-section">
            <h2 className="document-section-band">
              <span>{String(index + 1).padStart(2, "0")}</span>
              {categoryLabels[category]}
            </h2>
            <div>
              <ul className="agenda-list">
                {(groups[category] || []).length ? groups[category].map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                  </li>
                )) : <li className="muted">該当事項はありません。</li>}
              </ul>
            </div>
          </section>
        )) : (
          <p className="document-empty">顧客共有用のアジェンダ項目はまだありません。</p>
        )}
      </div>
    </article>
  );
}

function categoryDescription(category) {
  return {
    previous: "過去実績、前回から残る論点、過去の決定事項や宿題の実施状況。",
    current: "現在の資金繰り、納付予定、中間納税、相談事項。",
    next: "業績着地予測、短期経営計画、今後の打ち手や期限付き宿題。"
  }[category];
}
