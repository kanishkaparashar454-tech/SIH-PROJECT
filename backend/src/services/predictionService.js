// Baseline, model-ready predictor. Replace predictRoadRisk with a trained
// model call when historical labelled incidents are available.
function predictRoadRisk(road, features = {}) {
  const rainfallMm = Math.max(0, Number(features.rainfallMm) || 0);
  const riverLevel = Math.max(0, Number(features.riverLevel) || 0); // 0..1 normalized
  const soilSaturation = Math.max(0, Math.min(1, Number(features.soilSaturation) || 0));
  const weatherImpact = Math.min(45, rainfallMm * 1.5) + riverLevel * 30 + soilSaturation * 15;
  const roadImpact = Number(road.base_risk || 0) + (road.status === 'blocked' ? 35 : road.status === 'at-risk' ? 20 : 0);
  const probability = Math.round(Math.min(99, Math.max(0, roadImpact + weatherImpact)) * 10) / 10;
  const riskBand = probability >= 70 ? 'high' : probability >= 40 ? 'medium' : 'low';
  return {
    roadId: road.id,
    roadName: road.name,
    probability,
    riskBand,
    predictedStatus: riskBand === 'high' ? 'blocked' : riskBand === 'medium' ? 'at-risk' : 'open',
    estimatedDelayMinutes: Number(road.estimated_delay_minutes || 0) + (riskBand === 'high' ? 120 : riskBand === 'medium' ? 40 : 0),
    features: { rainfallMm, riverLevel, soilSaturation },
    model: 'baseline-rule-v1'
  };
}
module.exports = { predictRoadRisk };
