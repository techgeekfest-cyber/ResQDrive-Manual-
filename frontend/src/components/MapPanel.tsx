import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Hazard, RiskLevel, RouteOption, Vehicle } from '../types';
import { ROADS } from '../data/roads';
import { computeRoadRisk, riskLevelFromScore, RISK_COLORS, RISK_LABEL } from '../utils/risk';
import { hazardLabel } from '../data/mockData';
import { timeAgo } from '../utils/format';
import { HYDERABAD_CENTER, HYDERABAD_ZOOM } from '../data/roads';

function vehicleIcon(status: Vehicle['status']) {
  const color = status === 'connected' ? '#22d3ee' : '#5b6472';
  return L.divIcon({
    className: '',
    html: `<div style="width:9px;height:9px;border-radius:9999px;background:${color};border:1.5px solid #070a10;box-shadow:0 0 0 2px ${color}33;"></div>`,
    iconSize: [9, 9],
    iconAnchor: [4.5, 4.5],
  });
}

function hazardIcon(risk: RiskLevel) {
  const color = RISK_COLORS[risk].hex;
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;">
      <div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:14px solid ${color};filter:drop-shadow(0 0 3px ${color}aa);"></div>
    </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 10],
  });
}

interface MapPanelProps {
  vehicles?: Vehicle[];
  hazards?: Hazard[];
  showLegend?: boolean;
  routes?: RouteOption[];
  heightClass?: string;
  center?: [number, number];
  zoom?: number;
}

export function MapPanel({
  vehicles = [],
  hazards = [],
  showLegend = true,
  routes,
  heightClass = 'h-[520px]',
  center = HYDERABAD_CENTER,
  zoom = HYDERABAD_ZOOM,
}: MapPanelProps) {
  return (
    <div className={`relative w-full overflow-hidden rounded-lg border border-border ${heightClass}`}>
      <MapContainer center={center} zoom={zoom} className="h-full w-full" zoomControl={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          className="rq-dark-tiles"
        />

        {ROADS.map((road) => {
          const risk = computeRoadRisk(hazards, road.id);
          const c = RISK_COLORS[risk];
          return (
            <Polyline
              key={road.id}
              positions={road.coords}
              pathOptions={{ color: c.hex, weight: risk === 'safe' ? 3 : 5, opacity: risk === 'safe' ? 0.55 : 0.9 }}
            />
          );
        })}

        {routes?.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coords}
            pathOptions={{
              color: route.id === 'safe' ? '#22c55e' : '#22d3ee',
              weight: 5,
              opacity: 0.85,
              dashArray: route.id === 'fastest' ? '2 8' : undefined,
            }}
          />
        ))}

        {vehicles.map((v) => (
          <Marker key={v.id} position={v.position} icon={vehicleIcon(v.status)}>
            <Popup>
              <div className="font-mono text-[11px] font-bold text-accent">{v.id}</div>
              <div className="mt-1 space-y-0.5 text-[11px] text-text-dim">
                <div>Status: <span className={v.status === 'connected' ? 'text-emerald-400' : 'text-text-faint'}>{v.status}</span></div>
                <div>Speed: {v.speedKmh} km/h</div>
                <div>Sensor health: {v.sensorHealth}%</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {hazards.filter((h) => h.status !== 'resolved').map((h) => {
          const risk = riskLevelFromScore(h.riskScore);
          const road = ROADS.find((r) => r.id === h.roadId);
          return (
            <Marker key={h.id} position={h.position} icon={hazardIcon(risk)}>
              <Popup>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] font-bold text-accent">{h.id}</span>
                  <span className="text-[10px] font-bold uppercase" style={{ color: RISK_COLORS[risk].hex }}>{RISK_LABEL[risk]}</span>
                </div>
                <div className="mt-1 space-y-0.5 text-[11px] text-text-dim">
                  <div className="text-text font-semibold">{hazardLabel(h.type)}</div>
                  <div>Location: {road?.name ?? h.roadId}</div>
                  <div>Confidence: {h.confidence}%</div>
                  <div>Vehicle evidence: {h.evidenceCount}</div>
                  <div>Verification: {h.verification}</div>
                  <div>Last seen: {timeAgo(h.lastSeen)}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {showLegend && (
        <div className="absolute bottom-3 left-3 z-[1000] rounded-md border border-border bg-panel/95 px-3 py-2 backdrop-blur">
          <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-text-faint">Road Risk</div>
          <div className="flex flex-col gap-1">
            {(['safe', 'caution', 'high', 'critical'] as RiskLevel[]).map((lvl) => (
              <div key={lvl} className="flex items-center gap-1.5 text-[10px] text-text-dim">
                <span className="h-2 w-2 rounded-sm" style={{ background: RISK_COLORS[lvl].hex }} />
                {RISK_LABEL[lvl]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
