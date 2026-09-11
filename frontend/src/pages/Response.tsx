import { Siren, Flag, ShieldCheck, HelpCircle, Truck, TriangleAlert } from 'lucide-react';
import { useSimulation } from '../state/SimulationContext';
import { KpiCard } from '../components/KpiCard';
import { IncidentTable } from '../components/IncidentTable';
import { riskLevelFromScore } from '../utils/risk';

export function Response() {
  const { hazards, vehicles, kpis } = useSimulation();
  const active = hazards.filter((h) => h.status === 'active');
  const p1 = active.filter((h) => h.priority === 'P1' || riskLevelFromScore(h.riskScore) === 'critical').length;
  const verified = active.filter((h) => h.verification === 'verified' || h.verification === 'corroborated').length;
  const unverified = active.length - verified;
  const availableVehicles = vehicles.filter((v) => v.status === 'connected').length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Emergency Response Command</h1>
        <p className="mt-0.5 text-xs text-text-dim">Prioritised, verified road intelligence for responders.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Active Incidents" value={active.length} icon={TriangleAlert} tone={active.length > 0 ? 'caution' : 'default'} />
        <KpiCard label="P1 Critical" value={p1} icon={Siren} tone={p1 > 0 ? 'critical' : 'default'} />
        <KpiCard label="Priority Zones" value={kpis.priorityZones} icon={Flag} tone="critical" />
        <KpiCard label="Verified Hazards" value={verified} icon={ShieldCheck} tone="safe" />
        <KpiCard label="Unverified Reports" value={unverified} icon={HelpCircle} tone="default" />
        <KpiCard label="Available Vehicles" value={availableVehicles} icon={Truck} tone="accent" />
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-faint">Priority Incident Queue</h3>
        <IncidentTable hazards={active} />
      </div>
    </div>
  );
}
