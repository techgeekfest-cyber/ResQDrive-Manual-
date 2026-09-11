import { Wifi, WifiOff, HeartPulse, LocateFixed, Gauge, Network } from 'lucide-react';
import { useSimulation } from '../state/SimulationContext';
import { KpiCard } from '../components/KpiCard';
import { VehicleTable } from '../components/VehicleTable';

export function Vehicles() {
  const { vehicles } = useSimulation();

  const connected = vehicles.filter((v) => v.status === 'connected').length;
  const disconnected = vehicles.length - connected;
  const avg = (key: 'sensorHealth' | 'gps' | 'networkLatencyMs') =>
    vehicles.length ? Math.round(vehicles.reduce((sum, v) => sum + v[key], 0) / vehicles.length) : 0;
  const fusionSuccess = vehicles.length ? Math.round((vehicles.filter((v) => v.sensorHealth >= 80).length / vehicles.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">Vehicle Sensing Network</h1>
        <p className="mt-0.5 text-xs text-text-dim">Fleet-level sensor health, GPS accuracy, and fusion status across all connected units.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Connected" value={connected} icon={Wifi} tone="safe" />
        <KpiCard label="Disconnected" value={disconnected} icon={WifiOff} tone={disconnected > 0 ? 'caution' : 'default'} />
        <KpiCard label="Avg Sensor Health" value={avg('sensorHealth')} suffix="%" icon={HeartPulse} tone="accent" />
        <KpiCard label="Avg GPS Accuracy" value={avg('gps')} suffix="%" icon={LocateFixed} tone="accent" />
        <KpiCard label="Avg Latency" value={avg('networkLatencyMs')} suffix="ms" icon={Gauge} tone="default" />
        <KpiCard label="Fusion Success" value={fusionSuccess} suffix="%" icon={Network} tone="safe" />
      </div>

      <VehicleTable vehicles={vehicles} />
    </div>
  );
}
