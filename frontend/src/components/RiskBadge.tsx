import type { RiskLevel } from '../types';
import { RISK_COLORS, RISK_LABEL } from '../utils/risk';

export function RiskBadge({ level, className = '' }: { level: RiskLevel; className?: string }) {
  const c = RISK_COLORS[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border ${c.border} ${c.bg} px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${c.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {RISK_LABEL[level]}
    </span>
  );
}

const VERIFICATION_STYLES: Record<string, string> = {
  verified: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  corroborated: 'text-accent bg-accent-soft border-accent-dim/40',
  unverified: 'text-text-dim bg-panel-2 border-border',
  conflicting: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
};

export function VerificationBadge({ state, className = '' }: { state: string; className?: string }) {
  const style = VERIFICATION_STYLES[state] ?? VERIFICATION_STYLES.unverified;
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style} ${className}`}>
      {state}
    </span>
  );
}
