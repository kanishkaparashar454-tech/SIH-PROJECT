const {Pool}=require('pg'); const {databaseUrl}=require('./env'); const pool=new Pool({connectionString:databaseUrl||undefined}); module.exports={pool,query:(t,p)=>pool.query(t,p)};
