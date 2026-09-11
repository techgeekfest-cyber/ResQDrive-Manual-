import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useSimulation } from '../state/SimulationContext';
import { ChartCard } from '../components/ChartCard';
import { HazardCard } from '../components/HazardCard';
import { hazardLabel } from '../data/mockData';
import { computeRoadRisk, RISK_COLORS } from '../utils/risk';
import type { RiskLevel } from '../types';

const TOOLTIP_STYLE = {
  background: '#10151d',
  border: '1px solid #202836',
  borderRadius: 8,
  fontSize: 11,
  color: '#d7dee8',
};

export function Hazards() {
  const { hazards, roads } = useSimulation();
  const active = hazards.filter((h) => h.status === 'active');

  const byType = useMemo(() => {
    const counts = new Map<string, number>();
    active.forEach((h) => counts.set(hazardLabel(h.type), (counts.get(hazardLabel(h.type)) ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [active]);

  const verification = useMemo(() => {
    const verified = active.filter((h) => h.verification === 'verified' || h.verification === 'corroborated').length;
    const unverified = active.length - verified;
    return [
      { name: 'Verified', value: verified, color: '#22c55e' },
      { name: 'Unverified', value: unverified, color: '#5b6472' },
    ];
  }, [active]);

  const riskDistribution = useMemo(() => {
    const levels: RiskLevel[] = ['safe', 'caution', 'high', 'critical'];
    const counts = levels.map((lvl) => ({
      name: lvl.toUpperCase(),
      count: roads.filter((r) => computeRoadRisk(hazards, r.id) === lvl).length,
      color: RISK_COLORS[lvl].hex,
    }));
    return counts;
  }, [roads, hazards]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Hazard Intelligence</h1>
        <p className="mt-0.5 text-xs text-text-dim">Multi-vehicle evidence fusion · confidence, verification & freshness per incident.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <ChartCard title="Hazards by Type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byType} margin={{ left: -20, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a212c" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5b6472' }} axisLine={{ stroke: '#202836' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#5b6472' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(34,211,238,0.06)' }} />
              <Bar dataKey="count" fill="#22d3ee" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Verified vs Unverified">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={verification} dataKey="value" nameKey="name" innerRadius={40} outerRadius={64} paddingAngle={2}>
                {verification.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="#0d1219" />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Road Risk Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskDistribution} layout="vertical" margin={{ left: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a212c" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#5b6472' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#5b6472' }} axisLine={false} tickLine={false} width={56} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(34,211,238,0.06)' }} />
              <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                {riskDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-faint">Incident Cards ({hazards.length})</h3>
        {hazards.length === 0 ? (
          <div className="rounded-lg border border-border bg-panel p-8 text-center text-xs text-text-faint">
            No hazards reported yet. Start the simulation or inject a hazard from the Simulation page.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hazards.map((h) => (
              <HazardCard key={h.id} hazard={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
