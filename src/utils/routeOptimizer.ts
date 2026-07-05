import { Booth } from '../data';

export interface HallPosition {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rotate: number;
}

export const HALL_POSITIONS: Record<string, HallPosition> = {
  '4.1H': { centerX: 131, centerY: 329, width: 300, height: 185, rotate: 45 },
  '3.1H': { centerX: 329, centerY: 131, width: 300, height: 185, rotate: 45 },
  '2.1H': { centerX: 671, centerY: 131, width: 300, height: 185, rotate: -45 },
  '1.1H': { centerX: 869, centerY: 329, width: 300, height: 185, rotate: -45 },
  '7.1H': { centerX: 671, centerY: 869, width: 300, height: 185, rotate: 45 },
  '8.1H': { centerX: 869, centerY: 671, width: 300, height: 185, rotate: 45 },
  '6.1H': { centerX: 329, centerY: 869, width: 300, height: 185, rotate: -45 },
  '5.1H': { centerX: 131, centerY: 671, width: 300, height: 185, rotate: -45 },
};

/**
 * Calculates absolute global coordinates for a given booth based on its hall card and internal map percentage,
 * accounting for 2D rotation.
 */
export function getGlobalCoordinates(booth: Booth): { x: number; y: number } {
  const pos = HALL_POSITIONS[booth.hall];
  if (!pos) return { x: 500, y: 500 };
  
  // Local coordinate relative to the hall center (unrotated)
  const localX = (booth.mapX / 100 - 0.5) * pos.width;
  const localY = (booth.mapY / 100 - 0.5) * pos.height;
  
  // Convert angle to radians
  const rad = (pos.rotate * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  // Rotate local coordinate and translate back to global space
  const rotatedX = pos.centerX + localX * cos - localY * sin;
  const rotatedY = pos.centerY + localX * sin + localY * cos;
  
  return { 
    x: Math.round(rotatedX), 
    y: Math.round(rotatedY) 
  };
}

/**
 * Calculates straight line distance (in virtual meters) between two coordinate points.
 */
export function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Solves the Traveling Salesperson Problem (TSP) using a Nearest-Neighbor heuristic,
 * starting from the South Hall Entrance.
 */
export function planOptimalRoute(booths: Booth[]): Booth[] {
  if (booths.length <= 1) return booths;

  const startPoint = { x: 500, y: 960 }; // Bottom center of 1000x1000 canvas (South Entrance)
  const unvisited = [...booths];
  const optimized: Booth[] = [];

  let currentPoint = startPoint;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const boothCoords = getGlobalCoordinates(unvisited[i]);
      const dist = getDistance(currentPoint, boothCoords);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextBooth = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nextBooth);
    currentPoint = getGlobalCoordinates(nextBooth);
  }

  return optimized;
}

/**
 * Recommends up to `maxCount` booths with freebies that are physically closest to the planned route
 * but not yet included in the route or checklist.
 */
export function getConvenientRecommendations(
  route: Booth[],
  allBooths: Booth[],
  maxCount: number = 3
): Booth[] {
  if (route.length === 0) {
    // If route is empty, recommend some popular/featured booths that are close to the Entrance
    const entrance = { x: 500, y: 960 };
    return allBooths
      .filter(b => b.freebies.length > 0)
      .map(b => ({
        booth: b,
        dist: getDistance(entrance, getGlobalCoordinates(b)),
      }))
      .sort((a, b) => a.dist - b.dist)
      .map(item => item.booth)
      .slice(0, maxCount);
  }

  const routeIds = new Set(route.map(b => b.id));
  const candidates = allBooths.filter(b => !routeIds.has(b.id) && b.freebies.length > 0);

  const recommended = candidates.map(candidate => {
    const coordCand = getGlobalCoordinates(candidate);
    let minDistance = Infinity;

    // Find the minimum distance to any booth currently in the planned route
    for (const routeBooth of route) {
      const coordRoute = getGlobalCoordinates(routeBooth);
      const dist = getDistance(coordCand, coordRoute);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    return { booth: candidate, distance: minDistance };
  });

  // Sort by proximity. We focus on booths within a reasonable proximity threshold.
  return recommended
    .filter(item => item.distance < 300)
    .sort((a, b) => a.distance - b.distance)
    .map(item => item.booth)
    .slice(0, maxCount);
}

/**
 * Estimates the total walking distance of the route in meters.
 * Assumes 1 coordinate unit corresponds to approximately 0.8 meters in the physical National Exhibition and Convention Center.
 */
export function estimateTotalDistance(route: Booth[]): number {
  if (route.length === 0) return 0;
  
  let totalDist = 0;
  let currentPoint = { x: 500, y: 960 }; // Start at South Entrance

  for (const booth of route) {
    const coords = getGlobalCoordinates(booth);
    totalDist += getDistance(currentPoint, coords);
    currentPoint = coords;
  }

  // Multiply by scale factor (0.8) to convert to approximate meters
  return Math.round(totalDist * 0.8);
}
