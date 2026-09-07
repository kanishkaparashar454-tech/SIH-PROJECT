const auth=require('../services/authService'); const wrap=f=>(q,s,n)=>Promise.resolve(f(q,s,n)).catch(n);
module.exports={register:wrap(async(q,s)=>s.status(201).json({user:await auth.register(q.body)})),login:wrap(async(q,s)=>s.json(await auth.login(q.body.email,q.body.password))),me:wrap(async(q,s)=>s.json({user:q.user}))};
