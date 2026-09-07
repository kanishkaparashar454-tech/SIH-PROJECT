const { weatherKey } = require('../config/env');
async function getWeather(lat,lon) { if (!weatherKey) return {source:'unconfigured',rainfallMm:0,riskMultiplier:1}; const r=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric`); if(!r.ok) throw Error(`Weather API returned ${r.status}`); const d=await r.json(); const rainfallMm=d.rain?.['1h']||0; return {source:'openweathermap',rainfallMm,riskMultiplier:rainfallMm>15?1.5:rainfallMm>5?1.2:1,raw:d}; }
module.exports={getWeather};
