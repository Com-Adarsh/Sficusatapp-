import 'dotenv/config';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool, PoolClient } from 'pg';
import { z } from 'zod';
import { registerCbtRoutes } from './cbt.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export type AuthUser = { id:string; email:string; roles:string[]; permissions:string[] };

const env=z.object({
  NODE_ENV:z.string().default('development'),
  PORT:z.coerce.number().int().positive().default(4000),
  HOST:z.string().default('0.0.0.0'),
  DATABASE_URL:z.string().min(1),
  JWT_SECRET:z.string().min(32),
  JWT_EXPIRES_IN:z.string().default('2h'),
  CORS_ORIGIN:z.string().default('http://localhost:3000')
}).parse(process.env);

export const db=new Pool({connectionString:env.DATABASE_URL,max:20,idleTimeoutMillis:30000});
export const app=Fastify({logger:true,bodyLimit:2*1024*1024});

async function loadUser(id:string):Promise<AuthUser|null>{
  const r=await db.query(
    `SELECT u.id,u.email,
      COALESCE(array_agg(DISTINCT ro.name) FILTER(WHERE ro.name IS NOT NULL),'{}') roles,
      COALESCE(array_agg(DISTINCT p.code) FILTER(WHERE p.code IS NOT NULL),'{}') permissions
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id=u.id
     LEFT JOIN roles ro ON ro.id=ur.role_id
     LEFT JOIN role_permissions rp ON rp.role_id=ro.id
     LEFT JOIN permissions p ON p.id=rp.permission_id
     WHERE u.id=$1 AND u.status='active'
     GROUP BY u.id,u.email`,[id]);
  if(!r.rowCount)return null;
  return r.rows[0] as AuthUser;
}

function sign(user:AuthUser){return jwt.sign({sub:user.id},env.JWT_SECRET,{expiresIn:env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']});}

export async function authenticate(req:FastifyRequest,reply:FastifyReply){
  const header=req.headers.authorization;
  if(!header?.startsWith('Bearer ')) return reply.code(401).send({error:'Authentication required'});
  try{
    const payload=jwt.verify(header.slice(7),env.JWT_SECRET) as jwt.JwtPayload;
    const user=await loadUser(String(payload.sub));
    if(!user) return reply.code(401).send({error:'Session is invalid or expired'});
    req.user=user;
  }catch{return reply.code(401).send({error:'Invalid or expired token'});}
}

export function requirePermission(code:string){
  return async(req:FastifyRequest,reply:FastifyReply)=>{
    const result=await authenticate(req,reply);
    if(result)return result;
    if(req.user?.roles.includes('super_admin')||req.user?.permissions.includes(code))return;
    return reply.code(403).send({error:'Forbidden',permission:code});
  };
}

async function audit(actor:string,action:string,type:string,id:string|null,before:any=null,after:any=null){
  await db.query('INSERT INTO audit_logs(actor_user_id,action,entity_type,entity_id,before_data,after_data) VALUES($1,$2,$3,$4,$5,$6)',[actor,action,type,id,before,after]);
}

app.register(cors,{origin:env.CORS_ORIGIN==='*'?true:env.CORS_ORIGIN});
app.register(helmet);
app.register(rateLimit,{max:120,timeWindow:'1 minute'});

app.get('/health',async()=>({ok:true,service:'sfi-cusat-backend',timestamp:new Date().toISOString()}));
app.get('/api/health',async()=>({ok:true}));

app.post('/api/auth/register',async(req,reply)=>{
  const body=z.object({email:z.string().email().transform(v=>v.trim().toLowerCase()),password:z.string().min(8).max(128),fullName:z.string().trim().min(2).max(120),rollNumber:z.string().trim().min(1).max(80).optional()}).parse(req.body);
  const client=await db.connect();
  try{
    await client.query('BEGIN');
    if(body.rollNumber){
      const exists=await client.query('SELECT 1 FROM student_profiles WHERE normalized_roll_number=$1',[body.rollNumber.toLowerCase().replace(/\\s+/g,'')]);
      if(exists.rowCount){await client.query('ROLLBACK');return reply.code(409).send({error:'This roll number is already registered. Please sign in.'});}
    }
    const hash=await bcrypt.hash(body.password,12);
    const u=await client.query('INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id,email',[body.email,hash]);
    await client.query('INSERT INTO profiles(user_id,full_name) VALUES($1,$2)',[u.rows[0].id,body.fullName]);
    if(body.rollNumber) await client.query('INSERT INTO student_profiles(user_id,normalized_roll_number) VALUES($1,$2)',[u.rows[0].id,body.rollNumber.toLowerCase().replace(/\\s+/g,'')]);
    const role=(await client.query("SELECT id FROM roles WHERE name='student'")).rows[0];
    if(role)await client.query('INSERT INTO user_roles(user_id,role_id,module) VALUES($1,$2,$3)',[u.rows[0].id,role.id,'platform']);
    await client.query('COMMIT');
    const user=await loadUser(u.rows[0].id);
    return reply.code(201).send({user,token:sign(user!)});
  }catch(e){await client.query('ROLLBACK');if((e as any)?.code==='23505')return reply.code(409).send({error:'An account with this email or roll number already exists.'});throw e}finally{client.release();}
});

app.post('/api/auth/login',async(req,reply)=>{
  const body=z.object({email:z.string().email().transform(v=>v.trim().toLowerCase()),password:z.string().min(1)}).parse(req.body);
  const r=await db.query('SELECT id,email,password_hash FROM users WHERE email=$1 AND status=\'active\'',[body.email]);
  if(!r.rowCount||!(await bcrypt.compare(body.password,r.rows[0].password_hash)))return reply.code(401).send({error:'Invalid email or password'});
  const user=await loadUser(r.rows[0].id); return {user,token:sign(user!)};
});

app.get('/api/me',{preHandler:authenticate},async(req)=>({user:req.user}));
app.get('/api/departments',async()=>({departments:(await db.query("SELECT id,name,short_name,description,official_email,website,building,room,phone FROM departments WHERE status='verified' ORDER BY name")).rows}));

app.post('/api/academic/departments',{preHandler:requirePermission('department.create')},async(req,reply)=>{
  const b=z.object({name:z.string().trim().min(2).max(150),shortName:z.string().trim().max(30).optional(),description:z.string().max(2000).optional(),officialEmail:z.string().email().optional(),website:z.string().url().optional(),building:z.string().max(120).optional(),room:z.string().max(80).optional(),phone:z.string().max(40).optional(),programmes:z.string().max(2000).optional()}).parse(req.body);
  const r=await db.query('INSERT INTO departments(name,short_name,description,official_email,website,building,room,phone,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',[b.name,b.shortName??null,b.description??null,b.officialEmail??null,b.website??null,b.building??null,b.room??null,b.phone??null,req.user!.id]);
  await audit(req.user!.id,'department.create','department',r.rows[0].id,null,r.rows[0]);
  return reply.code(201).send({department:r.rows[0],message:'Department submitted for verification'});
});

app.get('/api/academic/exams',async(req)=>{
  const q=z.object({status:z.string().optional(),departmentId:z.string().uuid().optional()}).parse(req.query);
  const args:any[]=[];const where:string[]=[];
  if(q.status){args.push(q.status);where.push(`e.status=$${args.length}`)} else where.push("e.status IN ('scheduled','registration_open','live','closed','results_ready')");
  if(q.departmentId){args.push(q.departmentId);where.push(`e.department_id=$${args.length}`)}
  const r=await db.query(`SELECT e.id,e.title,e.description,e.instructions,e.starts_at,e.ends_at,e.duration_minutes,e.attempts_allowed,e.negative_marking_enabled,e.access_type,e.status,d.name department_name, count(er.id)::int registrations
    FROM exams e LEFT JOIN departments d ON d.id=e.department_id LEFT JOIN exam_registrations er ON er.exam_id=e.id AND er.status='registered'
    WHERE ${where.join(' AND ')} GROUP BY e.id,d.name ORDER BY e.starts_at`,args);
  return {exams:r.rows};
});

app.post('/api/helpdesk/tickets',{preHandler:requirePermission('helpdesk.ticket.create')},async(req,reply)=>{
  const b=z.object({category:z.string().min(1).max(80),subcategory:z.string().max(80).optional(),title:z.string().min(3).max(200),description:z.string().min(5).max(5000),priority:z.enum(['low','normal','high','critical']).default('normal')}).parse(req.body);
  const r=await db.query('INSERT INTO helpdesk_tickets(created_by,category,subcategory,title,description,priority) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[req.user!.id,b.category,b.subcategory??null,b.title,b.description,b.priority]);
  await audit(req.user!.id,'helpdesk.ticket.create','helpdesk_ticket',r.rows[0].id,null,r.rows[0]); return reply.code(201).send({ticket:r.rows[0]});
});

app.post('/api/aashraya/requests',{preHandler:requirePermission('aashraya.request.create')},async(req,reply)=>{
  const b=z.object({patientName:z.string().min(2).max(120),bloodGroup:z.string().min(1).max(10),hospital:z.string().min(2).max(200),location:z.string().max(200).optional(),urgency:z.enum(['normal','urgent','critical']).default('normal'),unitsRequired:z.number().int().positive().max(20).default(1),neededAt:z.string().datetime().optional(),contactMethod:z.string().max(200).optional()}).parse(req.body);
  const r=await db.query('INSERT INTO blood_requests(created_by,patient_name,blood_group,hospital,location,urgency,units_required,needed_at,contact_method) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',[req.user!.id,b.patientName,b.bloodGroup,b.hospital,b.location??null,b.urgency,b.unitsRequired,b.neededAt??null,b.contactMethod??null]);
  return reply.code(201).send({request:r.rows[0]});
});

app.post('/api/sahayi/requests',{preHandler:requirePermission('sahayi.request.create')},async(req,reply)=>{
  const b=z.object({eventName:z.string().max(200).optional(),examDate:z.string(),startTime:z.string().optional(),location:z.string().max(200).optional(),requirements:z.string().max(5000).optional()}).parse(req.body);
  const r=await db.query('INSERT INTO scribe_requests(requester_id,event_name,exam_date,start_time,location,requirements) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[req.user!.id,b.eventName??null,b.examDate,b.startTime??null,b.location??null,b.requirements??null]);
  return reply.code(201).send({request:r.rows[0]});
});

app.post('/api/samskara/events',{preHandler:requirePermission('samskara.manage')},async(req,reply)=>{
  const b=z.object({title:z.string().min(2).max(200),description:z.string().max(5000).optional(),category:z.string().max(100).optional(),startsAt:z.string().datetime().optional(),endsAt:z.string().datetime().optional(),venue:z.string().max(200).optional()}).parse(req.body);
  const r=await db.query('INSERT INTO events(title,description,category,starts_at,ends_at,venue,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[b.title,b.description??null,b.category??null,b.startsAt??null,b.endsAt??null,b.venue??null,req.user!.id]);
  return reply.code(201).send({event:r.rows[0]});
});

app.get('/api/scholarx/opportunities',async()=>({opportunities:(await db.query("SELECT * FROM opportunities WHERE status='approved' AND (deadline IS NULL OR deadline>=now()) ORDER BY deadline NULLS LAST")).rows}));

registerCbtRoutes(app,db,{authenticate,requirePermission,audit});
app.setErrorHandler((error,req,reply)=>{
  if(error instanceof z.ZodError)return reply.code(400).send({error:'Invalid request',details:error.issues});
  req.log.error(error); return reply.code(500).send({error:'Internal server error'});
});

if(process.env.NODE_ENV!=='test'){
  app.listen({port:env.PORT,host:env.HOST}).catch(async e=>{app.log.error(e);await db.end();process.exit(1);});
}
export {env};
