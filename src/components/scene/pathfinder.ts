import { ClinicZoneId } from '../../types/clinic';

export interface PathNode {
  id: string;
  x: number;
  z: number;
  zone?: ClinicZoneId;
  neighbors: string[];
}

export const WAYPOINT_GRAPH: Record<string, PathNode> = {
  welcome: {
    id: 'welcome',
    x: 0,
    z: 9.8,
    zone: 'welcome',
    neighbors: ['waiting_room_center'],
  },
  waiting_room_center: {
    id: 'waiting_room_center',
    x: 0,
    z: 6.2,
    neighbors: ['welcome', 'reception', 'waiting_chairs', 'passage_south'],
  },
  reception: {
    id: 'reception',
    x: -3.8,
    z: 6.2,
    zone: 'reception',
    neighbors: ['waiting_room_center'],
  },
  waiting_chairs: {
    id: 'waiting_chairs',
    x: 5.2,
    z: 6.2,
    zone: 'waiting_chairs',
    neighbors: ['waiting_room_center'],
  },
  passage_south: {
    id: 'passage_south',
    x: 4.5,
    z: 3.2,
    neighbors: ['waiting_room_center', 'passage_mid'],
  },
  passage_mid: {
    id: 'passage_mid',
    x: 4.5,
    z: 0.0,
    neighbors: ['passage_south', 'medicine_access', 'passage_north'],
  },
  medicine_access: {
    id: 'medicine_access',
    x: 1.0,
    z: 0.0,
    neighbors: ['passage_mid', 'medicine_shelves'],
  },
  medicine_shelves: {
    id: 'medicine_shelves',
    x: -2.0,
    z: 0.0,
    zone: 'medicine_cabin',
    neighbors: ['medicine_access'],
  },
  passage_north: {
    id: 'passage_north',
    x: 4.5,
    z: -3.2,
    neighbors: ['passage_mid', 'cabin_foyer', 'cabin_east'],
  },
  cabin_foyer: {
    id: 'cabin_foyer',
    x: 0.0,
    z: -3.2,
    neighbors: ['passage_north', 'cabin_door'],
  },
  cabin_door: {
    id: 'cabin_door',
    x: -2.5,
    z: -3.2,
    neighbors: ['cabin_foyer', 'cabin_inner'],
  },
  cabin_inner: {
    id: 'cabin_inner',
    x: -2.5,
    z: -5.5,
    neighbors: ['cabin_door', 'doctor_desk', 'cabin_east'],
  },
  doctor_desk: {
    id: 'doctor_desk',
    x: -2.2,
    z: -7.0,
    zone: 'doctor_desk',
    neighbors: ['cabin_inner'],
  },
  cabin_east: {
    id: 'cabin_east',
    x: 4.0,
    z: -5.5,
    neighbors: ['passage_north', 'cabin_inner', 'examination_bed'],
  },
  examination_bed: {
    id: 'examination_bed',
    x: 5.8,
    z: -7.5,
    zone: 'examination_bed',
    neighbors: ['cabin_east'],
  },
};

/**
 * Finds the shortest path in the waypoint graph between two nodes using Breadth-First Search (BFS)
 */
export function findPath(startNodeId: string, targetNodeId: string): Array<{ x: number; z: number }> {
  if (startNodeId === targetNodeId) {
    const node = WAYPOINT_GRAPH[startNodeId];
    return node ? [{ x: node.x, z: node.z }] : [];
  }

  const queue: string[][] = [[startNodeId]];
  const visited = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentId = path[path.length - 1];

    if (currentId === targetNodeId) {
      return path.map((id) => ({
        x: WAYPOINT_GRAPH[id].x,
        z: WAYPOINT_GRAPH[id].z,
      }));
    }

    const neighbors = WAYPOINT_GRAPH[currentId]?.neighbors || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  // Fallback direct line
  const start = WAYPOINT_GRAPH[startNodeId];
  const target = WAYPOINT_GRAPH[targetNodeId];
  if (start && target) {
    return [{ x: start.x, z: start.z }, { x: target.x, z: target.z }];
  }
  return [];
}

/**
 * Find closest waypoint node to a given position (x, z)
 */
export function getClosestNode(x: number, z: number): string {
  let closestId = 'welcome';
  let minDistance = Infinity;

  for (const [id, node] of Object.entries(WAYPOINT_GRAPH)) {
    const distSq = (node.x - x) ** 2 + (node.z - z) ** 2;
    if (distSq < minDistance) {
      minDistance = distSq;
      closestId = id;
    }
  }

  return closestId;
}
