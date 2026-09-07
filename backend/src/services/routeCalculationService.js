const { query } = require('../config/db');

const earthRadius = 6371000;
function metersBetween([lon1, lat1], [lon2, lat2]) {
  const radians = Math.PI / 180;
  const dLat = (lat2 - lat1) * radians, dLon = (lon2 - lon1) * radians;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * radians) * Math.cos(lat2 * radians) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function keyFor([lon, lat]) { return `${Number(lon).toFixed(6)},${Number(lat).toFixed(6)}`; }

async function calculateRoute({ fromLat, fromLon, toLat, toLon }) {
  const roads = (await query(`SELECT id,name,status,base_risk,estimated_delay_minutes,ST_AsGeoJSON(geom)::json AS geometry FROM roads WHERE geom IS NOT NULL AND status <> 'blocked'`)).rows;
  const nodes = [], nodeByKey = new Map();
  const getNode = coordinate => {
    const key = keyFor(coordinate);
    if (!nodeByKey.has(key)) { nodeByKey.set(key, nodes.length); nodes.push({ coordinate, edges: [] }); }
    return nodeByKey.get(key);
  };

  // Every edge is one real consecutive pair from an imported road LineString.
  // We intentionally do not join merely nearby points: that could invent a road connection.
  for (const road of roads) {
    const coordinates = road.geometry?.coordinates || [];
    const segmentCount = Math.max(1, coordinates.length - 1);
    for (let index = 1; index < coordinates.length; index += 1) {
      const start = getNode(coordinates[index - 1]), end = getNode(coordinates[index]);
      if (start === end) continue;
      const lengthMeters = metersBetween(coordinates[index - 1], coordinates[index]);
      const delayMinutes = Number(road.estimated_delay_minutes || 0) / segmentCount;
      const cost = lengthMeters * (1 + Number(road.base_risk || 0) / 100) + delayMinutes * 100;
      const edge = { road, lengthMeters, delayMinutes, cost };
      nodes[start].edges.push({ to: end, edge });
      nodes[end].edges.push({ to: start, edge });
    }
  }
  if (!nodes.length) return null;

  const nearestNode = point => {
    let result = { index: -1, distanceMeters: Infinity };
    nodes.forEach((node, index) => {
      const distanceMeters = metersBetween(point, node.coordinate);
      if (distanceMeters < result.distanceMeters) result = { index, distanceMeters };
    });
    return result;
  };
  const source = nearestNode([fromLon, fromLat]), target = nearestNode([toLon, toLat]);
  // We only accept points close enough to the imported road network. This prevents a fake route across the map.
  if (source.distanceMeters > 750 || target.distanceMeters > 750 || source.index === target.index) return null;

  const distances = Array(nodes.length).fill(Infinity), previous = Array(nodes.length).fill(null), visited = new Set();
  distances[source.index] = 0;
  while (visited.size < nodes.length) {
    let current = -1, best = Infinity;
    distances.forEach((value, index) => { if (!visited.has(index) && value < best) { best = value; current = index; } });
    if (current < 0 || current === target.index) break;
    visited.add(current);
    for (const next of nodes[current].edges) {
      const candidate = distances[current] + next.edge.cost;
      if (candidate < distances[next.to]) { distances[next.to] = candidate; previous[next.to] = { node: current, edge: next.edge }; }
    }
  }
  if (!Number.isFinite(distances[target.index])) return null;

  const path = [];
  for (let node = target.index; node !== source.index; node = previous[node].node) path.unshift({ from: previous[node].node, to: node, edge: previous[node].edge });
  const coordinates = path.flatMap((step, index) => index ? [nodes[step.to].coordinate] : [nodes[step.from].coordinate, nodes[step.to].coordinate]);
  const totalMeters = path.reduce((sum, step) => sum + step.edge.lengthMeters, 0);
  const delayMinutes = path.reduce((sum, step) => sum + step.edge.delayMinutes, 0);
  const usedRoads = [...new Map(path.map(step => [step.edge.road.id, step.edge.road])).values()];
  return {
    geometry: { type: 'LineString', coordinates },
    distanceKm: Number((totalMeters / 1000).toFixed(2)),
    estimatedMinutes: Math.ceil(totalMeters / 500 + delayMinutes),
    snappedStart: { longitude: nodes[source.index].coordinate[0], latitude: nodes[source.index].coordinate[1], distanceMeters: Math.round(source.distanceMeters) },
    snappedEnd: { longitude: nodes[target.index].coordinate[0], latitude: nodes[target.index].coordinate[1], distanceMeters: Math.round(target.distanceMeters) },
    roads: usedRoads.map(road => ({ id: road.id, name: road.name, status: road.status, baseRisk: Number(road.base_risk || 0) }))
  };
}
module.exports = { calculateRoute };
