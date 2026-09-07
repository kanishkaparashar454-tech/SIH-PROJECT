const { query } = require('../config/db');
const list=(table,where='',params=[])=>query(`SELECT * FROM ${table} ${where}`,params);
const vehicleGeo="CASE WHEN current_location IS NULL THEN NULL ELSE json_build_object('type','Point','coordinates',json_build_array(ST_X(current_location),ST_Y(current_location))) END AS location";
module.exports={
 roads:{
  all:()=>query('SELECT id,name,district_id,status,ST_AsGeoJSON(geom)::json AS geometry,base_risk,estimated_delay_minutes,updated_at FROM roads ORDER BY id'),
  map:({bbox,limit=100,offset=0,simplify=0}={})=>{const where=[],params=[];if(bbox){params.push(...bbox);where.push(`geom && ST_MakeEnvelope($1,$2,$3,$4,4326)`)}const geometry=simplify>0?`ST_SimplifyPreserveTopology(geom,$${params.length+1})`:'geom';if(simplify>0)params.push(simplify);params.push(limit,offset);return query(`SELECT id,name,district_id,status,ST_AsGeoJSON(${geometry},6)::json AS geometry,base_risk,estimated_delay_minutes,updated_at,COUNT(*) OVER() AS total FROM roads ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY id LIMIT $${params.length-1} OFFSET $${params.length}`,params)},
  byId:id=>query('SELECT id,name,district_id,status,base_risk,estimated_delay_minutes,ST_X(ST_PointOnSurface(geom)) AS longitude,ST_Y(ST_PointOnSurface(geom)) AS latitude FROM roads WHERE id=$1',[id]),
  updateStatus:(id,status)=>query('UPDATE roads SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING id,name,district_id,status,ST_AsGeoJSON(geom)::json AS geometry,base_risk,estimated_delay_minutes,updated_at',[status,id])
 },
 incidents:{
  all:({type,districtId,status,limit=50,offset=0}={})=>{const where=[],p=[];if(type){p.push(type);where.push(`type=$${p.length}`)}if(districtId){p.push(districtId);where.push(`district_id=$${p.length}`)}if(status){p.push(status);where.push(`status=$${p.length}`)}p.push(Math.min(100,Math.max(1,Number(limit)||50)));const lp=p.length;p.push(Math.max(0,Number(offset)||0));return query(`SELECT id,road_id,district_id,type,description,latitude,longitude,photo_url,reported_by,reported_at,status,status_updated_at FROM incidents ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY reported_at DESC LIMIT $${lp} OFFSET $${p.length}`,p)},
  byId:id=>query('SELECT id,road_id,district_id,type,description,latitude,longitude,photo_url,reported_by,reported_at,status,status_updated_at FROM incidents WHERE id=$1',[id]),
  updateStatus:(id,status)=>query('UPDATE incidents SET status=$1,status_updated_at=NOW() WHERE id=$2 RETURNING id,road_id,district_id,type,description,latitude,longitude,photo_url,reported_by,reported_at,status,status_updated_at',[status,id]),
  create:v=>query('INSERT INTO incidents (road_id,district_id,type,description,latitude,longitude,photo_url,reported_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',v)
 },
 vehicles:{all:()=>query(`SELECT id,truck_code,cargo_type,status,${vehicleGeo},last_seen FROM vehicles ORDER BY id`),updateLocation:(id,lat,lng)=>query(`UPDATE vehicles SET current_location=ST_SetSRID(ST_MakePoint($2,$1),4326),last_seen=NOW() WHERE id=$3 RETURNING id,truck_code,cargo_type,status,${vehicleGeo},last_seen`,[lat,lng,id])},
 alerts:{all:({unacknowledged}={})=>query(`SELECT * FROM alerts ${unacknowledged?'WHERE acknowledged_at IS NULL ':''}ORDER BY created_at DESC LIMIT 100`),create:v=>query('INSERT INTO alerts (type,road_id,district_id,message,severity) VALUES ($1,$2,$3,$4,$5) RETURNING *',v),acknowledge:id=>query('UPDATE alerts SET acknowledged_at=NOW() WHERE id=$1 RETURNING *',[id])},
 districts:{all:()=>query("SELECT id,name,state,ST_AsGeoJSON(boundary)::json AS boundary,ST_AsGeoJSON(centroid)::json AS centroid FROM districts ORDER BY name")}
};
