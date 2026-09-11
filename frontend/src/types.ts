export type LatLng = [number, number];

export type RiskLevel = 'safe' | 'caution' | 'high' | 'critical';

export type HazardType =
  | 'flood'
  | 'pothole'
  | 'fallen_tree'
  | 'landslide'
  | 'road_blockage'
  | 'debris';

/** The three hazards with real trained YOLO specialist models (ai/models/). */
export const TRAINED_HAZARDS: HazardType[] = ['flood', 'pothole', 'fallen_tree'];

export type VerificationState = 'unverified' | 'corroborated' | 'verified' | 'conflicting';

export type HazardStatus = 'active' | 'monitoring' | 'resolved';

export interface RoadSegment {
  id: string;
  name: string;
  coords: LatLng[];
  baseRisk: RiskLevel;
}

export interface Vehicle {
  id: string;
  roadId: string;
  position: LatLng;
  progress: number;
  direction: 1 | -1;
  speedKmh: number;
  status: 'connected' | 'disconnected';
  camera: number;
  gps: number;
  imu: number;
  networkLatencyMs: number;
  sensorHealth: number;
  lastObservation: string;
}

export interface Hazard {
  id: string;
  type: HazardType;
  roadId: string;
  position: LatLng;
  confidence: number;
  riskScore: number;
  verification: VerificationState;
  evidenceCount: number;
  firstSeen: string;
  lastSeen: string;
  status: HazardStatus;
  prototype: boolean;
  priority?: 'P1' | 'P2' | 'P3';
}

export type FeedLevel = 'info' | 'success' | 'warn' | 'critical';

export interface FeedEvent {
  id: string;
  time: string;
  message: string;
  level: FeedLevel;
}

export type SimSpeed = 1 | 2 | 5 | 10;

export interface RouteOption {
  id: 'fastest' | 'safe';
  label: string;
  coords: LatLng[];
  durationMin: number;
  riskScore: number;
  status: 'safe' | 'unsafe';
  avoided: string[];
  recommended: boolean;
}

export type ServiceState = 'online' | 'degraded' | 'offline' | 'not_deployed';

export interface ServiceStatusItem {
  name: string;
  state: ServiceState;
  latencyMs: number | null;
  lastUpdate: string;
  note: string;
}
