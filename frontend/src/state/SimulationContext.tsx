import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { FeedEvent, FeedLevel, Hazard, HazardType, ServiceStatusItem, SimSpeed, Vehicle } from '../types';
import { TRAINED_HAZARDS } from '../types';
import { ROADS, pointOnRoad, roadById } from '../data/roads';
import { hazardLabel, initialVehicles, makeHazard } from '../data/mockData';
import { computeRoadRisk, riskLevelFromScore } from '../utils/risk';

let feedSeq = 1;

function pushEvent(events: FeedEvent[], level: FeedLevel, message: string): FeedEvent[] {
  feedSeq += 1;
  const event: FeedEvent = { id: `evt-${feedSeq}`, time: new Date().toISOString(), message, level };
  return [event, ...events].slice(0, 60);
}

interface SimState {
  vehicles: Vehicle[];
  hazards: Hazard[];
  events: FeedEvent[];
  running: boolean;
  speed: SimSpeed;
  scenarioIndex: number;
  scenarioHazardId: string | null;
  tickCount: number;
}

const SCENARIO_LABELS = [
  'Normal traffic',
  'First detection',
  'Corroboration',
  'Confirmation',
  'Sensor fusion',
  'Road unsafe',
  'Safe route',
  'P1 alert',
  'Recovery',
];

const SCENARIO_ROAD_ID = 'pvnr-expressway';

type ScenarioResult = Pick<SimState, 'hazards' | 'events' | 'scenarioHazardId'>;

const SCENARIO_STEPS: ((state: SimState) => ScenarioResult)[] = [
  (state) => ({
    hazards: state.hazards,
    scenarioHazardId: state.scenarioHazardId,
    events: pushEvent(state.events, 'info', 'Normal traffic flow across the ResQDrive network'),
  }),
  (state) => {
    const road = roadById(SCENARIO_ROAD_ID);
    const hazard = makeHazard('flood', SCENARIO_ROAD_ID, false);
    hazard.confidence = 58;
    hazard.riskScore = 42;
    hazard.evidenceCount = 1;
    return {
      hazards: [hazard, ...state.hazards],
      scenarioHazardId: hazard.id,
      events: pushEvent(state.events, 'warn', `Flood detected on ${road.name} — confidence 58%`),
    };
  },
  (state) => {
    const road = roadById(SCENARIO_ROAD_ID);
    const hazards = state.hazards.map((h) =>
      h.id === state.scenarioHazardId
        ? { ...h, evidenceCount: 2, confidence: 74, verification: 'corroborated' as const, riskScore: 58, lastSeen: new Date().toISOString() }
        : h,
    );
    return {
      hazards,
      scenarioHazardId: state.scenarioHazardId,
      events: pushEvent(state.events, 'warn', `Second vehicle corroborated flood hazard on ${road.name}`),
    };
  },
  (state) => {
    const road = roadById(SCENARIO_ROAD_ID);
    const hazards = state.hazards.map((h) =>
      h.id === state.scenarioHazardId
        ? { ...h, evidenceCount: 3, confidence: 89, verification: 'verified' as const, riskScore: 70, lastSeen: new Date().toISOString() }
        : h,
    );
    return {
      hazards,
      scenarioHazardId: state.scenarioHazardId,
      events: pushEvent(state.events, 'success', `Flood hazard on ${road.name} CONFIRMED — 3-vehicle consensus`),
    };
  },
  (state) => ({
    hazards: state.hazards,
    scenarioHazardId: state.scenarioHazardId,
    events: pushEvent(state.events, 'info', 'Evidence fusion complete — multi-sensor consensus achieved'),
  }),
  (state) => {
    const road = roadById(SCENARIO_ROAD_ID);
    const hazards = state.hazards.map((h) =>
      h.id === state.scenarioHazardId ? { ...h, riskScore: 92, lastSeen: new Date().toISOString() } : h,
    );
    return {
      hazards,
      scenarioHazardId: state.scenarioHazardId,
      events: pushEvent(state.events, 'critical', `${road.name} marked UNSAFE — risk score 92`),
    };
  },
  (state) => {
    const road = roadById(SCENARIO_ROAD_ID);
    return {
      hazards: state.hazards,
      scenarioHazardId: state.scenarioHazardId,
      events: pushEvent(state.events, 'success', `Safe route generated — avoids ${road.name} (+0.6 min)`),
    };
  },
  (state) => {
    const hazards = state.hazards.map((h) => (h.id === state.scenarioHazardId ? { ...h, priority: 'P1' as const } : h));
    return {
      hazards,
      scenarioHazardId: state.scenarioHazardId,
      events: pushEvent(state.events, 'critical', 'P1 CRITICAL alert issued to response units'),
    };
  },
  (state) => {
    const road = roadById(SCENARIO_ROAD_ID);
    const hazards = state.hazards.map((h) =>
      h.id === state.scenarioHazardId ? { ...h, status: 'resolved' as const } : h,
    );
    return {
      hazards,
      scenarioHazardId: state.scenarioHazardId,
      events: pushEvent(state.events, 'success', `${road.name} restored to SAFE — hazard cleared`),
    };
  },
];

function createInitialState(): SimState {
  return {
    vehicles: initialVehicles(12),
    hazards: [],
    events: pushEvent([], 'info', 'ResQDrive network initialized — 12 vehicles online'),
    running: false,
    speed: 1,
    scenarioIndex: 0,
    scenarioHazardId: null,
    tickCount: 0,
  };
}

type Action =
  | { type: 'TICK' }
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'SET_SPEED'; speed: SimSpeed }
  | { type: 'INJECT'; hazardType: HazardType }
  | { type: 'CONFLICT' }
  | { type: 'CLEAR_ROAD' }
  | { type: 'RESOLVE'; hazardId: string };

function moveVehicle(v: Vehicle, speedMultiplier: number): Vehicle {
  const road = roadById(v.roadId);
  const delta = 0.006 * speedMultiplier * (v.speedKmh / 45);
  let progress = v.progress + v.direction * delta;
  let direction = v.direction;
  if (progress >= 1) {
    progress = 1;
    direction = -1;
  } else if (progress <= 0) {
    progress = 0;
    direction = 1;
  }
  const wander = (val: number) => Math.max(70, Math.min(100, Math.round(val + (Math.random() * 4 - 2))));
  const connected = v.status === 'disconnected' ? Math.random() < 0.15 : Math.random() > 0.01;
  return {
    ...v,
    progress,
    direction,
    position: pointOnRoad(road, progress),
    camera: wander(v.camera),
    gps: wander(v.gps),
    imu: wander(v.imu),
    sensorHealth: wander(v.sensorHealth),
    networkLatencyMs: Math.max(20, Math.min(240, Math.round(v.networkLatencyMs + (Math.random() * 30 - 15)))),
    status: connected ? 'connected' : 'disconnected',
    lastObservation: connected ? new Date().toISOString() : v.lastObservation,
    speedKmh: Math.max(15, Math.min(70, Math.round(v.speedKmh + (Math.random() * 6 - 3)))),
  };
}

function reducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case 'SET_SPEED':
      return { ...state, speed: action.speed };

    case 'RESET':
      return createInitialState();

    case 'START':
      if (state.running) return state;
      return { ...state, running: true, events: pushEvent(state.events, 'info', 'Simulation started — scenario: Cyclone + Urban Flood') };

    case 'INJECT': {
      const trained = TRAINED_HAZARDS.includes(action.hazardType);
      const hazard = makeHazard(action.hazardType, undefined, !trained);
      const road = roadById(hazard.roadId);
      return {
        ...state,
        hazards: [hazard, ...state.hazards],
        events: pushEvent(state.events, 'warn', `${hazardLabel(action.hazardType)} manually injected on ${road.name}`),
      };
    }

    case 'CONFLICT': {
      const active = state.hazards.filter((h) => h.status === 'active');
      if (active.length === 0) {
        return { ...state, events: pushEvent(state.events, 'info', 'No active hazards available to flag as conflicting') };
      }
      const target = active[Math.floor(Math.random() * active.length)];
      const hazards = state.hazards.map((h) =>
        h.id === target.id ? { ...h, verification: 'conflicting' as const, confidence: Math.max(20, h.confidence - 18) } : h,
      );
      return {
        ...state,
        hazards,
        events: pushEvent(state.events, 'warn', `Conflicting evidence received for ${target.id} (${hazardLabel(target.type)}) — confidence recalibrating`),
      };
    }

    case 'CLEAR_ROAD': {
      const active = state.hazards.filter((h) => h.status === 'active');
      if (active.length === 0) {
        return { ...state, events: pushEvent(state.events, 'info', 'No active hazards to clear') };
      }
      const target = active[0];
      const road = roadById(target.roadId);
      const hazards = state.hazards.map((h) => (h.roadId === target.roadId && h.status === 'active' ? { ...h, status: 'resolved' as const } : h));
      return {
        ...state,
        hazards,
        events: pushEvent(state.events, 'success', `${road.name} cleared — restored to SAFE`),
      };
    }

    case 'RESOLVE': {
      const target = state.hazards.find((h) => h.id === action.hazardId);
      if (!target) return state;
      const road = roadById(target.roadId);
      const hazards = state.hazards.map((h) => (h.id === action.hazardId ? { ...h, status: 'resolved' as const } : h));
      return {
        ...state,
        hazards,
        events: pushEvent(state.events, 'success', `${target.id} resolved by responder — ${road.name} clear`),
      };
    }

    case 'TICK': {
      if (!state.running) return state;
      const tickCount = state.tickCount + 1;
      const vehicles = state.vehicles.map((v) => moveVehicle(v, state.speed));

      let { hazards, events, scenarioIndex, scenarioHazardId } = state;
      const stepEvery = Math.max(1, Math.round(5 / state.speed));
      if (scenarioIndex < SCENARIO_STEPS.length && tickCount % stepEvery === 0) {
        const result = SCENARIO_STEPS[scenarioIndex]({ ...state, vehicles, tickCount });
        hazards = result.hazards;
        events = result.events;
        scenarioHazardId = result.scenarioHazardId;
        scenarioIndex = scenarioIndex + 1;
      }

      return { ...state, vehicles, hazards, events, scenarioIndex, scenarioHazardId, tickCount };
    }

    default:
      return state;
  }
}

export interface Kpis {
  activeVehicles: number;
  totalVehicles: number;
  activeHazards: number;
  roadsAtRisk: number;
  verifiedIncidents: number;
  networkConfidence: number;
  priorityZones: number;
}

interface SimulationContextValue {
  vehicles: Vehicle[];
  hazards: Hazard[];
  events: FeedEvent[];
  running: boolean;
  speed: SimSpeed;
  scenarioIndex: number;
  scenarioLabel: string;
  kpis: Kpis;
  roads: typeof ROADS;
  services: ServiceStatusItem[];
  start: () => void;
  reset: () => void;
  setSpeed: (speed: SimSpeed) => void;
  injectHazard: (type: HazardType) => void;
  flagConflict: () => void;
  clearRoad: () => void;
  resolveHazard: (hazardId: string) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    if (!state.running) return;
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(interval);
  }, [state.running]);

  const kpis: Kpis = useMemo(() => {
    const activeHazardsList = state.hazards.filter((h) => h.status === 'active');
    const roadsAtRiskSet = new Set(
      ROADS.filter((r) => computeRoadRisk(state.hazards, r.id) !== 'safe').map((r) => r.id),
    );
    const avgConfidence = activeHazardsList.length
      ? Math.round(activeHazardsList.reduce((sum, h) => sum + h.confidence, 0) / activeHazardsList.length)
      : 100;
    return {
      activeVehicles: state.vehicles.filter((v) => v.status === 'connected').length,
      totalVehicles: state.vehicles.length,
      activeHazards: activeHazardsList.length,
      roadsAtRisk: roadsAtRiskSet.size,
      verifiedIncidents: state.hazards.filter((h) => h.verification === 'verified').length,
      networkConfidence: avgConfidence,
      priorityZones: activeHazardsList.filter((h) => riskLevelFromScore(h.riskScore) === 'critical' || h.priority === 'P1').length,
    };
  }, [state.vehicles, state.hazards]);

  const services: ServiceStatusItem[] = useMemo(
    () => [
      {
        name: 'AI Inference',
        state: 'degraded',
        latencyMs: null,
        lastUpdate: 'Phase 2',
        note: 'Local YOLO specialists (flood, pothole, fallen_tree) load via ai/inference/. No web-facing inference API yet.',
      },
      {
        name: 'FastAPI',
        state: 'not_deployed',
        latencyMs: null,
        lastUpdate: 'Not started',
        note: 'Backend service has not been implemented yet — planned Phase 3+.',
      },
      {
        name: 'PostgreSQL / PostGIS',
        state: 'not_deployed',
        latencyMs: null,
        lastUpdate: 'Not started',
        note: 'Spatial database has not been implemented yet — planned Phase 3+.',
      },
      {
        name: 'Evidence Fusion',
        state: 'not_deployed',
        latencyMs: null,
        lastUpdate: 'Simulated',
        note: 'Multi-vehicle corroboration is simulated in-browser for this demo.',
      },
      {
        name: 'Routing',
        state: 'not_deployed',
        latencyMs: null,
        lastUpdate: 'Simulated',
        note: 'Risk-aware fastest/safe route generation is simulated in-browser for this demo.',
      },
      {
        name: 'Frontend',
        state: 'online',
        latencyMs: 8,
        lastUpdate: 'now',
        note: 'React + Vite command center running locally in demo mode.',
      },
    ],
    [],
  );

  const value: SimulationContextValue = {
    vehicles: state.vehicles,
    hazards: state.hazards,
    events: state.events,
    running: state.running,
    speed: state.speed,
    scenarioIndex: state.scenarioIndex,
    scenarioLabel: SCENARIO_LABELS[Math.min(state.scenarioIndex, SCENARIO_LABELS.length - 1)],
    kpis,
    roads: ROADS,
    services,
    start: () => dispatch({ type: 'START' }),
    reset: () => dispatch({ type: 'RESET' }),
    setSpeed: (speed) => dispatch({ type: 'SET_SPEED', speed }),
    injectHazard: (hazardType) => dispatch({ type: 'INJECT', hazardType }),
    flagConflict: () => dispatch({ type: 'CONFLICT' }),
    clearRoad: () => dispatch({ type: 'CLEAR_ROAD' }),
    resolveHazard: (hazardId) => dispatch({ type: 'RESOLVE', hazardId }),
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}

export const SCENARIO_STEP_LABELS = SCENARIO_LABELS;
