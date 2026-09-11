import { useEffect, useState } from 'react';
import { Wifi, WifiOff, User } from 'lucide-react';
import { useSimulation } from '../state/SimulationContext';
import { isBackendConfigured } from '../services/api';

export function StatusBar() {
  const { running, scenarioLabel } = useSimulation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-panel px-4 py-2.5 text-xs">
      <div className="flex items-center gap-1.5 text-text-dim">
        <span className="font-mono text-text">
          {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </span>
        <span className="text-text-faint">IST</span>
      </div>

      <span className="h-3.5 w-px bg-border" />

      <span className="inline-flex items-center gap-1.5 rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 font-semibold tracking-wide text-yellow-400">
        DEMO DATA
      </span>

      <span className="inline-flex items-center gap-1.5 text-text-dim">
        {isBackendConfigured ? (
          <Wifi className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 text-text-faint" />
        )}
        {isBackendConfigured ? 'Backend Connected' : 'Backend Not Connected — Simulation Mode'}
      </span>

      <span className="h-3.5 w-px bg-border" />

      <span className="inline-flex items-center gap-1.5 text-text-dim">
        <span className={`h-2 w-2 rounded-full ${running ? 'bg-accent animate-pulse-dot' : 'bg-text-faint'}`} />
        Simulation: <span className={running ? 'text-accent font-medium' : 'text-text-dim'}>{running ? scenarioLabel : 'Idle'}</span>
      </span>

      <span className="ml-auto flex items-center gap-1.5 text-text-dim">
        <User className="h-3.5 w-3.5" />
        Operator: <span className="text-text font-medium">Command Desk</span>
      </span>
    </div>
  );
}
