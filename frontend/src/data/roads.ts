import type { RoadSegment } from '../types';

export const HYDERABAD_CENTER: [number, number] = [17.4239, 78.4738];
export const HYDERABAD_ZOOM = 12;

export const ROADS: RoadSegment[] = [
  {
    id: 'pvnr-expressway',
    name: 'PVNR Expressway',
    baseRisk: 'safe',
    coords: [
      [17.4401, 78.3489],
      [17.4430, 78.3650],
      [17.4460, 78.3790],
      [17.4483, 78.3915],
    ],
  },
  {
    id: 'orr-gachibowli-kondapur',
    name: 'ORR — Gachibowli to Kondapur',
    baseRisk: 'safe',
    coords: [
      [17.4239, 78.3475],
      [17.4420, 78.3540],
      [17.4600, 78.3600],
      [17.4750, 78.3800],
    ],
  },
  {
    id: 'tank-bund-road',
    name: 'Tank Bund Road',
    baseRisk: 'safe',
    coords: [
      [17.4239, 78.4738],
      [17.4283, 78.4761],
      [17.4326, 78.4785],
    ],
  },
  {
    id: 'necklace-road',
    name: 'Necklace Road',
    baseRisk: 'safe',
    coords: [
      [17.4180, 78.4620],
      [17.4260, 78.4700],
      [17.4330, 78.4790],
    ],
  },
  {
    id: 'begumpet-road',
    name: 'Begumpet Road',
    baseRisk: 'safe',
    coords: [
      [17.4400, 78.4650],
      [17.4425, 78.4700],
      [17.4450, 78.4750],
    ],
  },
  {
    id: 'kukatpally-jntu-road',
    name: 'Kukatpally – JNTU Road',
    baseRisk: 'safe',
    coords: [
      [17.4930, 78.3996],
      [17.4850, 78.4100],
      [17.4700, 78.4200],
    ],
  },
  {
    id: 'lb-nagar-ring-road',
    name: 'LB Nagar Ring Road',
    baseRisk: 'safe',
    coords: [
      [17.3460, 78.5530],
      [17.3600, 78.5490],
      [17.3700, 78.5400],
    ],
  },
  {
    id: 'miyapur-road',
    name: 'Miyapur Road',
    baseRisk: 'safe',
    coords: [
      [17.4970, 78.3580],
      [17.4920, 78.3640],
      [17.4880, 78.3700],
    ],
  },
  {
    id: 'uppal-road',
    name: 'Uppal Road',
    baseRisk: 'safe',
    coords: [
      [17.4000, 78.5590],
      [17.4025, 78.5545],
      [17.4050, 78.5500],
    ],
  },
  {
    id: 'banjara-hills-road-12',
    name: 'Banjara Hills Road No. 12',
    baseRisk: 'safe',
    coords: [
      [17.4150, 78.4400],
      [17.4175, 78.4375],
      [17.4200, 78.4350],
    ],
  },
];

export function roadById(id: string): RoadSegment {
  const road = ROADS.find((r) => r.id === id);
  if (!road) throw new Error(`Unknown road id: ${id}`);
  return road;
}

export function pointOnRoad(road: RoadSegment, progress: number): [number, number] {
  const p = Math.min(1, Math.max(0, progress));
  const segCount = road.coords.length - 1;
  const scaled = p * segCount;
  const segIndex = Math.min(segCount - 1, Math.floor(scaled));
  const local = scaled - segIndex;
  const [lat1, lng1] = road.coords[segIndex];
  const [lat2, lng2] = road.coords[segIndex + 1];
  return [lat1 + (lat2 - lat1) * local, lng1 + (lng2 - lng1) * local];
}
