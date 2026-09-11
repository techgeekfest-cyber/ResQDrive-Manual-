import type { Hazard, LatLng, RouteOption } from '../types';
import { ROADS, roadById } from './roads';
import { riskLevelFromScore } from '../utils/risk';

export interface RoutePreset {
  id: string;
  startLabel: string;
  endLabel: string;
  fastestRoadIds: string[];
  safeRoadIds: string[];
  baseFastestMin: number;
  baseSafeMin: number;
}

export const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: 'gachibowli-hitec',
    startLabel: 'Gachibowli',
    endLabel: 'Hi-Tech City',
    fastestRoadIds: ['pvnr-expressway'],
    safeRoadIds: ['orr-gachibowli-kondapur', 'kukatpally-jntu-road'],
    baseFastestMin: 40.5,
    baseSafeMin: 41.1,
  },
  {
    id: 'kukatpally-begumpet',
    startLabel: 'Kukatpally',
    endLabel: 'Begumpet',
    fastestRoadIds: ['kukatpally-jntu-road', 'begumpet-road'],
    safeRoadIds: ['miyapur-road', 'orr-gachibowli-kondapur', 'begumpet-road'],
    baseFastestMin: 22.0,
    baseSafeMin: 24.5,
  },
  {
    id: 'secunderabad-banjarahills',
    startLabel: 'Secunderabad (Tank Bund)',
    endLabel: 'Banjara Hills',
    fastestRoadIds: ['tank-bund-road', 'necklace-road'],
    safeRoadIds: ['necklace-road', 'banjara-hills-road-12'],
    baseFastestMin: 15.0,
    baseSafeMin: 16.5,
  },
  {
    id: 'lbnagar-uppal',
    startLabel: 'LB Nagar',
    endLabel: 'Uppal',
    fastestRoadIds: ['lb-nagar-ring-road'],
    safeRoadIds: ['lb-nagar-ring-road', 'uppal-road'],
    baseFastestMin: 18.0,
    baseSafeMin: 19.4,
  },
];

function concatCoords(roadIds: string[]): LatLng[] {
  const coords: LatLng[] = [];
  roadIds.forEach((id, idx) => {
    const road = roadById(id);
    const points = idx === 0 ? road.coords : road.coords.slice(1);
    coords.push(...points);
  });
  return coords;
}

function maxRiskOnRoads(hazards: Hazard[], roadIds: string[]): number {
  const active = hazards.filter((h) => roadIds.includes(h.roadId) && h.status === 'active');
  if (active.length === 0) return 0;
  return Math.max(...active.map((h) => h.riskScore));
}

function roadNames(roadIds: string[]): string[] {
  return roadIds.map((id) => roadById(id).name);
}

export function computeRoutes(presetId: string, hazards: Hazard[]): RouteOption[] {
  const preset = ROUTE_PRESETS.find((p) => p.id === presetId) ?? ROUTE_PRESETS[0];

  const fastestRisk = maxRiskOnRoads(hazards, preset.fastestRoadIds);
  const fastestLevel = riskLevelFromScore(fastestRisk);
  const fastest: RouteOption = {
    id: 'fastest',
    label: 'Fastest Route',
    coords: concatCoords(preset.fastestRoadIds),
    durationMin: preset.baseFastestMin,
    riskScore: fastestRisk,
    status: fastestLevel === 'high' || fastestLevel === 'critical' ? 'unsafe' : 'safe',
    avoided: [],
    recommended: false,
  };

  const safeRisk = maxRiskOnRoads(hazards, preset.safeRoadIds);
  const avoidedRoadIds = preset.fastestRoadIds.filter((id) => {
    const risk = maxRiskOnRoads(hazards, [id]);
    return riskLevelFromScore(risk) === 'high' || riskLevelFromScore(risk) === 'critical';
  });
  const safe: RouteOption = {
    id: 'safe',
    label: 'Safe Route',
    coords: concatCoords(preset.safeRoadIds),
    durationMin: preset.baseSafeMin,
    riskScore: safeRisk,
    status: riskLevelFromScore(safeRisk) === 'high' || riskLevelFromScore(safeRisk) === 'critical' ? 'unsafe' : 'safe',
    avoided: roadNames(avoidedRoadIds),
    recommended: true,
  };

  return [fastest, safe];
}

export function allRoadNamesForPreset(presetId: string): { fastest: string[]; safe: string[] } {
  const preset = ROUTE_PRESETS.find((p) => p.id === presetId) ?? ROUTE_PRESETS[0];
  return { fastest: roadNames(preset.fastestRoadIds), safe: roadNames(preset.safeRoadIds) };
}

export { ROADS };
