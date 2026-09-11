import type { ReactNode } from 'react';

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-panel p-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[11px] text-text-faint">{subtitle}</p>}
      <div className="mt-3 h-48">{children}</div>
    </div>
  );
}
