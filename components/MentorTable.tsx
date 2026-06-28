"use client";

import { useState, Fragment } from "react";
import type { Mentor, SendStatus } from "@/lib/types";

const STATUS_STYLES: Record<SendStatus, { dot: string; label: string; text: string }> = {
  draft: { dot: "bg-faint", label: "Queue", text: "text-faint" },
  approved: { dot: "bg-active", label: "Approved", text: "text-active" },
  sent: { dot: "bg-active", label: "Sent", text: "text-active" },
  replied: { dot: "bg-positive", label: "Replied", text: "text-positive" },
  bounced: { dot: "bg-danger", label: "Bounced", text: "text-danger" },
};

const WAVE_LABELS: Record<number, string> = {
  1: "Day 1", 2: "Day 2", 3: "Day 3", 4: "Day 4", 5: "Day 5",
  6: "Day 6", 7: "Day 7", 8: "Day 8", 9: "Day 9", 10: "Day 10",
};

type Tab = "queue" | "sent";

type Notice = { kind: "ok" | "error"; text: string } | null;

export function MentorTable({
  initial,
  gmailReady,
}: {
  initial: Mentor[];
  gmailReady: boolean;
}) {
  const [mentors, setMentors] = useState<Mentor[]>(initial);
  const [tab, setTab] = useState<Tab>("queue");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [edits, setEdits] = useState<Record<number, { subject: string; body: string }>>({});
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [notice, setNotice] = useState<Notice>(null);
  const [filterDay, setFilterDay] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const queue = mentors.filter((m) => ["draft", "approved"].includes(m.sendStatus));
  const sent = mentors.filter((m) => ["sent", "replied", "bounced"].includes(m.sendStatus));

  const categories = Array.from(new Set(mentors.map((m) => m.category).filter(Boolean))).sort() as string[];
  const days = [1,2,3,4,5,6,7,8,9,10];

  function filterRows(rows: Mentor[]) {
    return rows.filter((m) => {
      if (filterDay !== null && m.waveDay !== filterDay) return false;
      if (filterCategory && m.category !== filterCategory) return false;
      return true;
    });
  }

  const displayed = filterRows(tab === "queue" ? queue : sent);

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getEdit(m: Mentor) {
    return edits[m.id] ?? { subject: m.subject, body: m.body };
  }

  async function handleSend(m: Mentor) {
    if (busy.has(m.id)) return;
    setBusy((p) => new Set(p).add(m.id));
    setNotice(null);

    // Persist any edits first
    const edit = edits[m.id];
    if (edit) {
      await fetch(`/api/mentor/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: edit.subject, body: edit.body }),
      });
    }

    const res = await fetch(`/api/send/${m.id}`, { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      setMentors((prev) =>
        prev.map((r) =>
          r.id === m.id ? { ...r, sendStatus: "sent", sentAt: new Date() } : r,
        ),
      );
      setNotice({ kind: "ok", text: `Sent to ${m.name}.` });
    } else {
      setNotice({ kind: "error", text: data.error ?? "Send failed" });
    }

    setBusy((p) => { const n = new Set(p); n.delete(m.id); return n; });
  }

  async function handleSaveEdit(id: number) {
    const edit = edits[id];
    if (!edit) return;
    await fetch(`/api/mentor/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: edit.subject, body: edit.body }),
    });
    setMentors((prev) =>
      prev.map((m) => m.id === id ? { ...m, subject: edit.subject, body: edit.body } : m),
    );
    setNotice({ kind: "ok", text: "Draft saved." });
  }

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm border-b-2 transition-colors ${
      tab === t
        ? "border-brand text-brand font-medium"
        : "border-transparent text-muted hover:text-ink"
    }`;

  return (
    <div className="mx-auto max-w-[1240px] px-8 pb-16 pt-6">
      {notice && (
        <div
          className={`mb-4 rounded border px-4 py-2 text-sm ${
            notice.kind === "ok"
              ? "border-positive/30 bg-positive/5 text-positive"
              : "border-danger/30 bg-danger/5 text-danger"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Tabs + filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border">
        <div className="flex">
          <button className={tabCls("queue")} onClick={() => setTab("queue")}>
            Queue ({queue.length})
          </button>
          <button className={tabCls("sent")} onClick={() => setTab("sent")}>
            Sent ({sent.length})
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <select
            value={filterDay ?? ""}
            onChange={(e) => setFilterDay(e.target.value ? parseInt(e.target.value) : null)}
            className="rounded border border-border bg-surface px-2 py-1 text-xs text-muted"
          >
            <option value="">All days</option>
            {days.map((d) => (
              <option key={d} value={d}>Week {d <= 5 ? 1 : 2} - Day {d}</option>
            ))}
          </select>
          <select
            value={filterCategory ?? ""}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="rounded border border-border bg-surface px-2 py-1 text-xs text-muted"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => { setFilterDay(null); setFilterCategory(null); }}
            className="text-xs text-faint hover:text-ink"
          >
            Clear
          </button>
        </div>
      </div>

      {displayed.length === 0 && (
        <div className="py-16 text-center text-sm text-faint">
          {tab === "queue" ? "All emails sent - great work!" : "No sent emails yet."}
        </div>
      )}

      <div className="divide-y divide-border rounded-lg border border-border">
        {displayed.map((m) => {
          const isOpen = expanded.has(m.id);
          const s = STATUS_STYLES[m.sendStatus];
          const edit = getEdit(m);
          const isBusy = busy.has(m.id);
          const canSend = gmailReady && ["draft", "approved"].includes(m.sendStatus);

          return (
            <Fragment key={m.id}>
              {/* Row */}
              <div
                className={`flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-alt ${isOpen ? "bg-surface-alt" : ""}`}
                onClick={() => toggleExpand(m.id)}
              >
                {/* Status dot */}
                <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />

                {/* Name + category */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{m.name}</span>
                    {m.category && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-faint">
                        {m.category}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted">{m.email}</div>
                </div>

                {/* Wave day */}
                <div className="hidden shrink-0 sm:block">
                  <span className="rounded bg-surface-alt border border-border px-2 py-0.5 text-[11px] text-faint">
                    {m.waveDay ? WAVE_LABELS[m.waveDay] : "-"}
                  </span>
                </div>

                {/* Status label */}
                <div className="shrink-0">
                  <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                  {m.sendStatus === "replied" && m.repliedAt && (
                    <div className="text-[10px] text-faint">
                      {new Date(m.repliedAt).toLocaleDateString()}
                    </div>
                  )}
                  {m.sendStatus === "sent" && m.sentAt && (
                    <div className="text-[10px] text-faint">
                      {new Date(m.sentAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <span className="shrink-0 text-faint">{isOpen ? "▲" : "▼"}</span>
              </div>

              {/* Expanded draft */}
              {isOpen && (
                <div className="border-t border-border bg-surface-alt px-5 py-5">
                  {/* Overlap */}
                  {m.overlap && (
                    <div className="mb-4 rounded border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-brand">
                      <span className="font-medium">Why this person:</span> {m.overlap}
                    </div>
                  )}

                  {/* Subject */}
                  <div className="mb-3">
                    <label className="mb-1 block text-[11px] uppercase tracking-wide text-faint">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={edit.subject}
                      onChange={(e) =>
                        setEdits((prev) => ({ ...prev, [m.id]: { ...edit, subject: e.target.value } }))
                      }
                      className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                    />
                  </div>

                  {/* Body */}
                  <div className="mb-4">
                    <label className="mb-1 block text-[11px] uppercase tracking-wide text-faint">
                      Email body (HTML)
                    </label>
                    <textarea
                      rows={10}
                      value={edit.body}
                      onChange={(e) =>
                        setEdits((prev) => ({ ...prev, [m.id]: { ...edit, body: e.target.value } }))
                      }
                      className="w-full rounded border border-border bg-surface px-3 py-2 font-mono text-xs text-ink focus:border-brand focus:outline-none"
                    />
                  </div>

                  {/* Preview */}
                  <details className="mb-4">
                    <summary className="cursor-pointer text-xs text-faint hover:text-muted">
                      Preview rendered email
                    </summary>
                    <div
                      className="mt-2 rounded border border-border bg-white p-4 text-sm text-ink"
                      dangerouslySetInnerHTML={{ __html: edit.body }}
                    />
                  </details>

                  {/* Actions */}
                  {["draft", "approved"].includes(m.sendStatus) && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSaveEdit(m.id); }}
                        className="rounded border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-ink hover:text-ink"
                      >
                        Save edits
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSend(m); }}
                        disabled={isBusy || !canSend}
                        className="rounded bg-brand px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isBusy ? "Sending..." : canSend ? "Approve & Send" : "Gmail not connected"}
                      </button>
                    </div>
                  )}

                  {m.sendStatus === "sent" && (
                    <div className="text-sm text-muted">
                      Sent {m.sentAt ? new Date(m.sentAt).toLocaleString() : ""}. Waiting for reply.
                    </div>
                  )}
                  {m.sendStatus === "replied" && (
                    <div className="text-sm font-medium text-positive">
                      Replied {m.repliedAt ? new Date(m.repliedAt).toLocaleString() : ""}
                    </div>
                  )}
                  {m.sendStatus === "bounced" && (
                    <div className="text-sm font-medium text-danger">
                      Bounced - email did not deliver.
                    </div>
                  )}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
