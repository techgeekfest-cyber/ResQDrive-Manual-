import type { Hazard, RiskLevel } from '../types';

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'caution';
  return 'safe';
}

export function computeRoadRisk(hazards: Hazard[], roadId: string): RiskLevel {
  const active = hazards.filter((h) => h.roadId === roadId && h.status === 'active');
  if (active.length === 0) return 'safe';
  const maxScore = Math.max(...active.map((h) => h.riskScore));
  return riskLevelFromScore(maxScore);
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  safe: 'SAFE',
  caution: 'CAUTION',
  high: 'HIGH',
  critical: 'CRITICAL',
};

export const RISK_COLORS: Record<RiskLevel, { text: string; bg: string; dot: string; border: string; hex: string }> = {
  safe: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', border: 'border-emerald-500/30', hex: '#22c55e' },
  caution: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400', border: 'border-yellow-500/30', hex: '#eab308' },
  high: { text: 'text-orange-400', bg: 'bg-orange-500/10', dot: 'bg-orange-400', border: 'border-orange-500/30', hex: '#f97316' },
  critical: { text: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400', border: 'border-red-500/30', hex: '#ef4444' },
};
