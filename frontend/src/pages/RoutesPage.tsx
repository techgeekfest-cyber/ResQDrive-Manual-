import { useState } from 'react';
import { Navigation } from 'lucide-react';
import { useSimulation } from '../state/SimulationContext';
import { ROUTE_PRESETS, computeRoutes } from '../data/routePresets';
import { RouteCard } from '../components/RouteCard';
import { MapPanel } from '../components/MapPanel';

export function RoutesPage() {
  const { hazards } = useSimulation();
  const [presetId, setPresetId] = useState(ROUTE_PRESETS[0].id);
  const [computedFor, setComputedFor] = useState<string | null>(ROUTE_PRESETS[0].id);

  const preset = ROUTE_PRESETS.find((p) => p.id === presetId) ?? ROUTE_PRESETS[0];
  const routes = computedFor ? computeRoutes(computedFor, hazards) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Risk-Aware Safe Routing</h1>
        <p className="mt-0.5 text-xs text-text-dim">Route cost = travel time + risk penalty.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-panel p-4">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-faint">Start</label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="w-52 rounded-md border border-border bg-panel-2 px-2.5 py-2 text-xs text-text focus:border-accent-dim/50 focus:outline-none"
          >
            {ROUTE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.startLabel}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-faint">Destination</label>
          <div className="flex w-52 items-center rounded-md border border-border bg-panel-2 px-2.5 py-2 text-xs text-text-dim">
            {preset.endLabel}
          </div>
        </div>
        <button
          onClick={() => setComputedFor(presetId)}
          className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-bold text-bg hover:brightness-110"
        >
          <Navigation className="h-3.5 w-3.5" /> Compute Routes
        </button>
      </div>

      {routes.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {routes.map((r) => (
              <RouteCard key={r.id} route={r} />
            ))}
          </div>
          <MapPanel routes={routes} showLegend={false} heightClass="h-[460px]" />
        </>
      )}
    </div>
  );
}
