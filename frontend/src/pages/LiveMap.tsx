import { useSimulation } from '../state/SimulationContext';
import { MapPanel } from '../components/MapPanel';

export function LiveMap() {
  const { vehicles, hazards } = useSimulation();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Live Map</h1>
        <p className="mt-0.5 text-xs text-text-dim">Vehicle positions, hazard markers, and colour-coded road risk across Hyderabad.</p>
      </div>

      <MapPanel vehicles={vehicles} hazards={hazards} heightClass="h-[calc(100vh-190px)]" zoom={12} />
    </div>
  );
}
