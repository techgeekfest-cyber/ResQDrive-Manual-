import type { Hazard } from '../types';
import { RiskBadge, VerificationBadge } from './RiskBadge';
import { hazardLabel } from '../data/mockData';
import { roadById } from '../data/roads';
import { riskLevelFromScore } from '../utils/risk';
import { timeAgo } from '../utils/format';
import { TRAINED_HAZARDS } from '../types';

export function HazardCard({ hazard }: { hazard: Hazard }) {
  const road = roadById(hazard.roadId);
  const risk = riskLevelFromScore(hazard.riskScore);
  const trained = TRAINED_HAZARDS.includes(hazard.type);

  return (
    <div className={`rounded-lg border bg-panel p-3.5 ${hazard.status === 'resolved' ? 'border-border opacity-60' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-accent">{hazard.id}</span>
            {hazard.priority && (
              <span className="rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
                {hazard.priority}
              </span>
            )}
            {!trained && <span className="rounded border border-border bg-panel-2 px-1.5 py-0.5 text-[9px] text-text-faint">PROTOTYPE</span>}
          </div>
          <h4 className="mt-1 text-sm font-semibold text-text">{hazardLabel(hazard.type)}</h4>
          <p className="text-[11px] text-text-dim">{road.name}</p>
        </div>
        <RiskBadge level={hazard.status === 'resolved' ? 'safe' : risk} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <div className="text-text-faint">Confidence</div>
          <div className="font-mono font-semibold text-text">{hazard.confidence}%</div>
        </div>
        <div>
          <div className="text-text-faint">Risk score</div>
          <div className="font-mono font-semibold text-text">{hazard.riskScore}</div>
        </div>
        <div>
          <div className="text-text-faint">Evidence</div>
          <div className="font-mono font-semibold text-text">{hazard.evidenceCount} vehicle(s)</div>
        </div>
        <div>
          <div className="text-text-faint">Freshness</div>
          <div className="font-mono font-semibold text-text">{timeAgo(hazard.lastSeen)}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-2.5">
        <VerificationBadge state={hazard.verification} />
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${hazard.status === 'resolved' ? 'text-text-faint' : 'text-accent'}`}>
          {hazard.status}
        </span>
      </div>
    </div>
  );
}
