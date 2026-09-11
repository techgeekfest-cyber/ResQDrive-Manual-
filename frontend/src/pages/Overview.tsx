import { Truck, TriangleAlert, Route, ShieldCheck, Signal, Flag } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { KpiCard } from '../components/KpiCard';
import { MapPanel } from '../components/MapPanel';
import { IntelligenceFeed } from '../components/IntelligenceFeed';
import { useSimulation } from '../state/SimulationContext';

export function Overview() {
  const { vehicles, hazards, kpis, events } = useSimulation();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">ResQDrive Command Center</h1>
        <p className="mt-0.5 text-xs text-text-dim">Live cooperative road-risk intelligence · Hyderabad · SIMULATED</p>
      </div>

      <StatusBar />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Active Vehicles" value={kpis.activeVehicles} icon={Truck} tone="accent" />
        <KpiCard label="Active Hazards" value={kpis.activeHazards} icon={TriangleAlert} tone={kpis.activeHazards > 0 ? 'caution' : 'default'} />
        <KpiCard label="Roads at Risk" value={kpis.roadsAtRisk} icon={Route} tone={kpis.roadsAtRisk > 0 ? 'critical' : 'safe'} />
        <KpiCard label="Verified Incidents" value={kpis.verifiedIncidents} icon={ShieldCheck} tone="safe" />
        <KpiCard label="Network Confidence" value={kpis.networkConfidence} suffix="%" icon={Signal} tone="accent" />
        <KpiCard label="Priority Zones" value={kpis.priorityZones} icon={Flag} tone={kpis.priorityZones > 0 ? 'critical' : 'default'} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <MapPanel vehicles={vehicles} hazards={hazards} heightClass="h-[560px]" />
        <div className="h-[560px]">
          <IntelligenceFeed events={events} />
        </div>
      </div>
    </div>
  );
}
