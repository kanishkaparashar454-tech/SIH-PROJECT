const express=require('express'); const c=require('../controllers/authController'); const {optionalAuth,requireRole}=require('../middleware/auth'); const r=express.Router();
r.post('/register',c.register); r.post('/login',c.login); r.get('/me',optionalAuth,requireRole('admin','field_officer'),c.me); module.exports=r;
