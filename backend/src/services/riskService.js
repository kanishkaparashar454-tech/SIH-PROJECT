const { query } = require('../config/db');
async function scoreRoute(ids=[]) { if (!ids.length) return []; const rows=(await query('SELECT id,name,status,base_risk,estimated_delay_minutes FROM roads WHERE id=ANY($1::int[])',[ids])).rows; return rows.map(x=>({...x,riskScore:Math.min(100,Number(x.base_risk||0)+(x.status==='blocked'?80:x.status==='at-risk'?40:0)),estimatedDelayMinutes:Number(x.estimated_delay_minutes||0)+(x.status==='blocked'?120:0)})).sort((a,b)=>a.riskScore-b.riskScore); }
module.exports={scoreRoute};
