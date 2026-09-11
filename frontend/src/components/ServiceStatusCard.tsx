import type { ServiceStatusItem } from '../types';

const STATE_STYLES: Record<ServiceStatusItem['state'], { label: string; dot: string; text: string }> = {
  online: { label: 'ONLINE', dot: 'bg-emerald-400 animate-pulse-dot', text: 'text-emerald-400' },
  degraded: { label: 'PARTIAL', dot: 'bg-yellow-400', text: 'text-yellow-400' },
  offline: { label: 'OFFLINE', dot: 'bg-red-400', text: 'text-red-400' },
  not_deployed: { label: 'NOT DEPLOYED', dot: 'bg-text-faint', text: 'text-text-faint' },
};

export function ServiceStatusCard({ service }: { service: ServiceStatusItem }) {
  const style = STATE_STYLES[service.state];
  return (
    <div className="rounded-lg border border-border bg-panel p-3.5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text">{service.name}</h4>
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide ${style.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <div className="text-text-faint">Latency</div>
          <div className="font-mono text-text-dim">{service.latencyMs != null ? `${service.latencyMs} ms` : '—'}</div>
        </div>
        <div>
          <div className="text-text-faint">Last update</div>
          <div className="font-mono text-text-dim">{service.lastUpdate}</div>
        </div>
      </div>
      <p className="mt-2.5 border-t border-border-soft pt-2 text-[11px] leading-snug text-text-faint">{service.note}</p>
    </div>
  );
}
