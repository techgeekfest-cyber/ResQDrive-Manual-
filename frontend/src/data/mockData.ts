import type { Hazard, HazardType, Vehicle } from '../types';
import { ROADS, pointOnRoad } from './roads';

let vehicleSeq = 100;
let hazardSeq = 2000;

export function nextVehicleId(): string {
  vehicleSeq += 1;
  return `RQ-${vehicleSeq}`;
}

export function nextHazardId(): string {
  hazardSeq += 1;
  return `INC-${hazardSeq}`;
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function makeVehicle(roadId?: string): Vehicle {
  const road = ROADS[Math.floor(Math.random() * ROADS.length)];
  const assignedRoadId = roadId ?? road.id;
  const assignedRoad = ROADS.find((r) => r.id === assignedRoadId) ?? road;
  const progress = Math.random();
  return {
    id: nextVehicleId(),
    roadId: assignedRoad.id,
    position: pointOnRoad(assignedRoad, progress),
    progress,
    direction: Math.random() > 0.5 ? 1 : -1,
    speedKmh: Math.round(rand(28, 62)),
    status: Math.random() > 0.06 ? 'connected' : 'disconnected',
    camera: Math.round(rand(82, 99)),
    gps: Math.round(rand(85, 99)),
    imu: Math.round(rand(88, 99)),
    networkLatencyMs: Math.round(rand(35, 180)),
    sensorHealth: Math.round(rand(85, 99)),
    lastObservation: new Date().toISOString(),
  };
}

export function initialVehicles(count = 12): Vehicle[] {
  return Array.from({ length: count }, () => makeVehicle());
}

const HAZARD_LABELS: Record<HazardType, string> = {
  flood: 'Flood Water',
  pothole: 'Pothole',
  fallen_tree: 'Fallen Tree',
  landslide: 'Landslide',
  road_blockage: 'Road Blockage',
  debris: 'Debris Field',
};

export function hazardLabel(type: HazardType): string {
  return HAZARD_LABELS[type];
}

export function makeHazard(type: HazardType, roadId?: string, prototype = false): Hazard {
  const road = roadId
    ? ROADS.find((r) => r.id === roadId)!
    : ROADS[Math.floor(Math.random() * ROADS.length)];
  const now = new Date().toISOString();
  return {
    id: nextHazardId(),
    type,
    roadId: road.id,
    position: pointOnRoad(road, rand(0.2, 0.8)),
    confidence: Math.round(rand(48, 62)),
    riskScore: Math.round(rand(35, 55)),
    verification: 'unverified',
    evidenceCount: 1,
    firstSeen: now,
    lastSeen: now,
    status: 'active',
    prototype,
  };
}
