import { CheckCircle2, Info, TriangleAlert, Siren } from 'lucide-react';
import type { FeedEvent, FeedLevel } from '../types';
import { formatClock } from '../utils/format';

const LEVEL_STYLES: Record<FeedLevel, { icon: typeof Info; color: string; bar: string }> = {
  info: { icon: Info, color: 'text-accent', bar: 'bg-accent' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bar: 'bg-emerald-400' },
  warn: { icon: TriangleAlert, color: 'text-yellow-400', bar: 'bg-yellow-400' },
  critical: { icon: Siren, color: 'text-red-400', bar: 'bg-red-400' },
};

export function IntelligenceFeed({ events, maxHeight = 'h-full' }: { events: FeedEvent[]; maxHeight?: string }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text">Live Intelligence Feed</h3>
        <span className="flex items-center gap-1 text-[10px] text-text-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          {events.length} events
        </span>
      </div>
      <div className={`flex-1 overflow-y-auto ${maxHeight} px-3 py-2`}>
        {events.length === 0 && (
          <p className="px-1 py-6 text-center text-xs text-text-faint">No events yet. Start the simulation to see live activity.</p>
        )}
        <ul className="space-y-1.5">
          {events.map((e) => {
            const style = LEVEL_STYLES[e.level];
            const Icon = style.icon;
            return (
              <li key={e.id} className="rq-fade-in flex gap-2 rounded-md border border-border-soft bg-bg-raised/60 px-2.5 py-2">
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${style.color}`} strokeWidth={2} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] leading-snug text-text">{e.message}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-text-faint">{formatClock(e.time)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
