import { Clock, ShieldCheck, Ban, Star } from 'lucide-react';
import type { RouteOption } from '../types';

export function RouteCard({ route }: { route: RouteOption }) {
  const isSafe = route.status === 'safe';
  return (
    <div
      className={`relative rounded-lg border bg-panel p-4 ${
        route.recommended ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-border'
      }`}
    >
      {route.recommended && (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-bg-raised px-2 py-0.5 text-[10px] font-bold text-emerald-400">
          <Star className="h-2.5 w-2.5 fill-emerald-400" /> RECOMMENDED
        </span>
      )}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wide text-text">{route.label}</h4>
        {isSafe ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <Ban className="h-4 w-4 text-red-400" />}
      </div>

      <div className="mt-3 flex items-end gap-1.5">
        <Clock className="mb-1 h-3.5 w-3.5 text-text-faint" />
        <span className="text-2xl font-bold tabular-nums text-text">{route.durationMin.toFixed(1)}</span>
        <span className="mb-0.5 text-xs text-text-faint">min</span>
      </div>

      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <span className={`font-semibold ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{isSafe ? 'Safe' : 'Unsafe'}</span>
        <span className="text-text-faint">·</span>
        <span className="font-mono text-text-dim">Risk {route.riskScore}</span>
      </div>

      {route.avoided.length > 0 && (
        <div className="mt-3 rounded-md border border-border-soft bg-bg-raised/60 p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-text-faint">Roads avoided</div>
          <ul className="mt-1 space-y-0.5">
            {route.avoided.map((name) => (
              <li key={name} className="text-[11px] text-text-dim">— {name}</li>
            ))}
          </ul>
          <div className="mt-1.5 text-[10px] text-text-faint">Reason: active verified hazard raises segment risk above safe threshold.</div>
        </div>
      )}
    </div>
  );
}
