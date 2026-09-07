const baseUrl=process.env.API_URL||'http://localhost:3000/api';
const intervalMs=Number(process.env.GPS_INTERVAL_MS||5000);
const vehicles=[
 {id:1,truck:'NER-MED-001',path:[[24.82,94.05],[24.84,94.08],[24.86,94.11],[24.84,94.14]]},
 {id:2,truck:'NER-FOOD-002',path:[[27.33,88.62],[27.34,88.66],[27.35,88.70],[27.34,88.66]]},
 {id:3,truck:'NER-BLD-003',path:[[27.59,92.67],[27.54,92.62],[27.48,92.57],[27.54,92.62]]}
];
let step=0;
async function tick(){for(const v of vehicles){const [latitude,longitude]=v.path[step%v.path.length];try{const r=await fetch(`${baseUrl}/vehicle/${v.id}/location`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({latitude,longitude})});if(!r.ok)console.error(`${v.truck}: API returned ${r.status}`);else console.log(`${v.truck}: ${latitude},${longitude}`)}catch(e){console.error(`${v.truck}: ${e.message}`)}}step++}
console.log(`GPS simulator started (every ${intervalMs}ms). Press Ctrl+C to stop.`);tick();const timer=setInterval(tick,intervalMs);process.on('SIGINT',()=>{clearInterval(timer);console.log('GPS simulator stopped.');process.exit(0)});
