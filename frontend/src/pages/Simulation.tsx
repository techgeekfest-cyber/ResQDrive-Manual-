import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';
import { useSimulation, SCENARIO_STEP_LABELS } from '../state/SimulationContext';
import { SimulationControls } from '../components/SimulationControls';
import { IntelligenceFeed } from '../components/IntelligenceFeed';

export function Simulation() {
  const { running, scenarioIndex, events } = useSimulation();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Simulation Control Center</h1>
        <p className="mt-0.5 text-xs text-text-dim">
          Scenario: <span className="font-semibold text-accent">Cyclone + Urban Flood</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <SimulationControls />

          <div className="rounded-lg border border-border bg-panel p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text">Scripted Event Sequence</h3>
            <ol className="mt-3 space-y-1.5">
              {SCENARIO_STEP_LABELS.map((label, idx) => {
                const done = idx < scenarioIndex;
                const isCurrent = idx === scenarioIndex && running;
                return (
                  <li
                    key={label}
                    className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-xs ${
                      done
                        ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400'
                        : isCurrent
                          ? 'border-accent-dim/40 bg-accent-soft text-accent'
                          : 'border-border-soft bg-bg-raised/40 text-text-faint'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                    ) : (
                      <CircleDashed className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="font-mono text-[10px] text-text-faint">{String(idx + 1).padStart(2, '0')}</span>
                    {label}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="h-[560px] lg:h-auto">
          <IntelligenceFeed events={events} />
        </div>
      </div>
    </div>
  );
}
