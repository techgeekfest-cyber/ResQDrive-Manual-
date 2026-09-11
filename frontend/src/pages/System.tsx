import { ArrowRight, Truck, Cpu, GitMerge, Database, Route, Monitor } from 'lucide-react';
import { useSimulation } from '../state/SimulationContext';
import { ServiceStatusCard } from '../components/ServiceStatusCard';

const ARCH_NODES = [
  { label: 'Vehicle Fleet', icon: Truck, state: 'live' },
  { label: 'AI Inference', icon: Cpu, state: 'partial' },
  { label: 'Evidence Fusion', icon: GitMerge, state: 'planned' },
  { label: 'PostGIS / FastAPI', icon: Database, state: 'planned' },
  { label: 'Routing Engine', icon: Route, state: 'planned' },
  { label: 'Frontend', icon: Monitor, state: 'live' },
];

const NODE_STYLES: Record<string, string> = {
  live: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  partial: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
  planned: 'border-border bg-panel-2 text-text-faint',
};

export function System() {
  const { services } = useSimulation();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">System Status</h1>
        <p className="mt-0.5 text-xs text-text-dim">Live service health across the ResQDrive stack.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <ServiceStatusCard key={s.name} service={s} />
        ))}
      </div>

      <div className="rounded-lg border border-border bg-panel p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text">System Architecture</h3>
        <p className="mt-0.5 text-[11px] text-text-faint">Green = implemented and running · Yellow = local-only · Grey = planned (Phase 3+)</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 overflow-x-auto py-2">
          {ARCH_NODES.map((node, idx) => {
            const Icon = node.icon;
            return (
              <div key={node.label} className="flex items-center gap-2">
                <div className={`flex w-32 flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center ${NODE_STYLES[node.state]}`}>
                  <Icon className="h-4 w-4" />
                  <span className="text-[11px] font-semibold leading-tight">{node.label}</span>
                </div>
                {idx < ARCH_NODES.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-faint" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
