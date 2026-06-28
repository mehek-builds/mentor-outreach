"use client";

import { useState } from "react";

export function Header({ total, gmailReady }: { total: number; gmailReady: boolean }) {
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncNote(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncNote(`Synced: ${data.replied} new replies, ${data.bounced} bounces (checked ${data.checked})`);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setSyncNote(data.error ?? "Sync failed");
      }
    } catch {
      setSyncNote("Network error");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-y-3 px-8 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-ink">Mentor Outreach</span>
          <span className="text-sm text-faint">{total} contacts</span>
        </div>
        <div className="flex items-center gap-3">
          {!gmailReady && (
            <span className="rounded border border-warn/30 bg-warn/5 px-2.5 py-1 text-xs text-warn">
              Gmail not connected - add env vars to send
            </span>
          )}
          {syncNote && (
            <span className="text-xs text-muted">{syncNote}</span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing || !gmailReady}
            className="rounded border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            {syncing ? "Syncing..." : "Sync Replies"}
          </button>
        </div>
      </div>
    </header>
  );
}
