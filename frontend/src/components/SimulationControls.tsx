import { Play, RotateCcw, Waves, Mountain, Construction, TreeDeciduous, CircleDot, GitCompareArrows, CheckCircle2 } from 'lucide-react';
import { useSimulation } from '../state/SimulationContext';
import type { SimSpeed } from '../types';

const SPEEDS: SimSpeed[] = [1, 2, 5, 10];

const INJECTIONS = [
  { label: 'Flood', type: 'flood' as const, icon: Waves },
  { label: 'Landslide', type: 'landslide' as const, icon: Mountain },
  { label: 'Road Blockage', type: 'road_blockage' as const, icon: Construction },
  { label: 'Fallen Tree', type: 'fallen_tree' as const, icon: TreeDeciduous },
  { label: 'Pothole', type: 'pothole' as const, icon: CircleDot },
];

export function SimulationControls() {
  const { running, speed, start, reset, setSpeed, injectHazard, flagConflict, clearRoad } = useSimulation();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-panel p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text">Playback</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={start}
            disabled={running}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-xs font-bold text-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" fill="currentColor" /> {running ? 'Running' : 'Start'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-md border border-border bg-panel-2 px-3.5 py-2 text-xs font-semibold text-text hover:bg-border/40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <span className="mx-1 h-6 w-px bg-border" />
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-md border px-3 py-2 text-xs font-bold font-mono ${
                speed === s ? 'border-accent-dim/50 bg-accent-soft text-accent' : 'border-border bg-panel-2 text-text-dim hover:bg-border/40'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-panel p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text">Manual Demo Injection</h3>
        <p className="mt-0.5 text-[11px] text-text-faint">Inject hazards on-demand for live audience demonstration.</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INJECTIONS.map(({ label, type, icon: Icon }) => (
            <button
              key={type}
              onClick={() => injectHazard(type)}
              className="flex items-center gap-1.5 rounded-md border border-border bg-panel-2 px-2.5 py-2 text-[11px] font-semibold text-text hover:border-accent-dim/40 hover:bg-accent-soft hover:text-accent"
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
          <button
            onClick={flagConflict}
            className="flex items-center gap-1.5 rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 py-2 text-[11px] font-semibold text-orange-400 hover:bg-orange-500/20"
          >
            <GitCompareArrows className="h-3.5 w-3.5" /> Conflicting Evidence
          </button>
          <button
            onClick={clearRoad}
            className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Road Clear
          </button>
        </div>
      </div>
    </div>
  );
}
