import type { Vehicle } from '../types';
import { roadById } from '../data/roads';
import { timeAgo } from '../utils/format';

function HealthBar({ value }: { value: number }) {
  const color = value >= 90 ? '#22c55e' : value >= 75 ? '#eab308' : '#ef4444';
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-panel-2">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-8 font-mono text-[11px] text-text-dim">{value}%</span>
    </div>
  );
}

export function VehicleTable({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-panel">
      <table className="w-full min-w-[860px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-text-faint">
            <th className="px-3 py-2.5">Vehicle</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5">Road</th>
            <th className="px-3 py-2.5">Speed</th>
            <th className="px-3 py-2.5">Camera</th>
            <th className="px-3 py-2.5">GPS</th>
            <th className="px-3 py-2.5">IMU</th>
            <th className="px-3 py-2.5">Network</th>
            <th className="px-3 py-2.5">Observation</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id} className="border-b border-border-soft last:border-0 hover:bg-panel-2/60">
              <td className="px-3 py-2 font-mono font-semibold text-text">{v.id}</td>
              <td className="px-3 py-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    v.status === 'connected'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-border bg-panel-2 text-text-faint'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${v.status === 'connected' ? 'bg-emerald-400 animate-pulse-dot' : 'bg-text-faint'}`} />
                  {v.status}
                </span>
              </td>
              <td className="px-3 py-2 text-text-dim">{roadById(v.roadId).name}</td>
              <td className="px-3 py-2 font-mono text-text-dim">{v.speedKmh} km/h</td>
              <td className="px-3 py-2"><HealthBar value={v.camera} /></td>
              <td className="px-3 py-2"><HealthBar value={v.gps} /></td>
              <td className="px-3 py-2"><HealthBar value={v.imu} /></td>
              <td className="px-3 py-2 font-mono text-text-dim">{v.networkLatencyMs} ms</td>
              <td className="px-3 py-2 text-text-faint">{timeAgo(v.lastObservation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
