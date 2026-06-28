import type { FunnelMetrics } from "@/lib/types";

function pct(n: number, d: number) {
  if (!d) return "-";
  return `${Math.round((n / d) * 100)}%`;
}

export function RatesBar({ metrics: m, total }: { metrics: FunnelMetrics; total: number }) {
  const queue = total - m.sent;

  const stages = [
    { label: "Total", value: total, sub: "50 mentors", dot: "bg-faint" },
    { label: "Queue", value: queue, sub: pct(queue, total) + " pending", dot: "bg-faint" },
    { label: "Sent", value: m.sent, sub: pct(m.sent, total) + " of total", dot: "bg-active" },
    { label: "Replied", value: m.replied, sub: pct(m.replied, m.sent) + " reply rate", dot: "bg-positive" },
  ];

  return (
    <div className="mx-auto max-w-[1240px] px-8 pt-5">
      <div className="flex flex-wrap items-stretch gap-px overflow-hidden rounded-lg border border-border bg-border">
        {stages.map((s) => (
          <div key={s.label} className="flex min-w-[110px] flex-1 flex-col gap-1 bg-surface px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              <span className="text-[11px] uppercase tracking-[0.06em] text-faint">{s.label}</span>
            </div>
            <span className="text-xl font-medium leading-none text-ink">{s.value}</span>
            <span className="text-[11px] text-muted">{s.sub}</span>
          </div>
        ))}
        <div className="flex min-w-[110px] flex-1 flex-col gap-1 bg-surface px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-danger" />
            <span className="text-[11px] uppercase tracking-[0.06em] text-faint">Bounced</span>
          </div>
          <span className={`text-xl font-medium leading-none ${m.bounced ? "text-danger" : "text-ink"}`}>
            {m.bounced}
          </span>
          <span className="text-[11px] text-muted">{pct(m.bounced, m.sent)} bounce rate</span>
        </div>
      </div>
    </div>
  );
}
