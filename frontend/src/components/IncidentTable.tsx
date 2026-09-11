import { CheckCircle2 } from 'lucide-react';
import type { Hazard } from '../types';
import { roadById } from '../data/roads';
import { hazardLabel } from '../data/mockData';
import { RiskBadge } from './RiskBadge';
import { riskLevelFromScore } from '../utils/risk';
import { timeAgo } from '../utils/format';
import { useSimulation } from '../state/SimulationContext';

function priorityOf(h: Hazard): 'P1' | 'P2' | 'P3' {
  if (h.priority) return h.priority;
  const risk = riskLevelFromScore(h.riskScore);
  if (risk === 'critical') return 'P1';
  if (risk === 'high') return 'P2';
  return 'P3';
}

const PRIORITY_STYLES: Record<string, string> = {
  P1: 'border-red-500/30 bg-red-500/10 text-red-400',
  P2: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  P3: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
};

export function IncidentTable({ hazards }: { hazards: Hazard[] }) {
  const { resolveHazard } = useSimulation();
  const sorted = [...hazards].sort((a, b) => {
    const rank = { P1: 0, P2: 1, P3: 2 };
    return rank[priorityOf(a)] - rank[priorityOf(b)] || b.riskScore - a.riskScore;
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-panel">
      <table className="w-full min-w-[980px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wider text-text-faint">
            <th className="px-3 py-2.5">Incident</th>
            <th className="px-3 py-2.5">Location</th>
            <th className="px-3 py-2.5">Hazard</th>
            <th className="px-3 py-2.5">Risk</th>
            <th className="px-3 py-2.5">Confidence</th>
            <th className="px-3 py-2.5">Evidence</th>
            <th className="px-3 py-2.5">Age</th>
            <th className="px-3 py-2.5">Priority</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-8 text-center text-text-faint">No active incidents. Start the simulation to generate live intelligence.</td>
            </tr>
          )}
          {sorted.map((h) => {
            const road = roadById(h.roadId);
            const priority = priorityOf(h);
            return (
              <tr key={h.id} className="border-b border-border-soft last:border-0 hover:bg-panel-2/60">
                <td className="px-3 py-2 font-mono font-semibold text-text">{h.id}</td>
                <td className="px-3 py-2 text-text-dim">{road.name}</td>
                <td className="px-3 py-2 text-text-dim">{hazardLabel(h.type)}</td>
                <td className="px-3 py-2"><RiskBadge level={riskLevelFromScore(h.riskScore)} /></td>
                <td className="px-3 py-2 font-mono text-text-dim">{h.confidence}%</td>
                <td className="px-3 py-2 font-mono text-text-dim">{h.evidenceCount}</td>
                <td className="px-3 py-2 text-text-faint">{timeAgo(h.firstSeen)}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-bold ${PRIORITY_STYLES[priority]}`}>{priority}</span>
                </td>
                <td className="px-3 py-2">
                  <span className={`text-[11px] font-medium ${h.status === 'resolved' ? 'text-text-faint' : 'text-accent'}`}>{h.status}</span>
                </td>
                <td className="px-3 py-2">
                  {h.status === 'active' ? (
                    <button
                      onClick={() => resolveHazard(h.id)}
                      className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Resolve
                    </button>
                  ) : (
                    <span className="text-[10px] text-text-faint">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
