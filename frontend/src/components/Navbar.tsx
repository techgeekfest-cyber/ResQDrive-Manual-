import { NavLink } from 'react-router-dom';
import { Activity, Map, Truck, TriangleAlert, Route, ShieldAlert, PlaySquare, Server, Radio } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: Activity, end: true },
  { to: '/map', label: 'Live Map', icon: Map, end: false },
  { to: '/vehicles', label: 'Vehicles', icon: Truck, end: false },
  { to: '/hazards', label: 'Hazards', icon: TriangleAlert, end: false },
  { to: '/routes', label: 'Routes', icon: Route, end: false },
  { to: '/response', label: 'Response', icon: ShieldAlert, end: false },
  { to: '/simulation', label: 'Simulation', icon: PlaySquare, end: false },
  { to: '/system', label: 'System', icon: Server, end: false },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-raised/95 backdrop-blur">
      <div className="flex h-14 items-center gap-6 px-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-soft border border-accent-dim/40">
            <Radio className="h-4 w-4 text-accent" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-text">ResQDrive</div>
            <div className="text-[9px] font-semibold tracking-[0.18em] text-accent">DISASTER INTELLIGENCE NETWORK</div>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-text-dim hover:bg-panel-2 hover:text-text'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
