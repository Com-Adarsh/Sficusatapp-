import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { z } from 'zod';

const env=z.object({PORT:z.coerce.number().default(4000),HOST:z.string().default('0.0.0.0'),DATABASE_URL:z.string(),JWT_SECRET:z.string().min(32),JWT_EXPIRES_IN:z.string().default('2h'),CORS_ORIGIN:z.string().default('http://localhost:3000')}).parse(process.env);
const db=new Pool({connectionString:env.DATABASE_URL,max:20});
const app=Fastify({logger:true});
await app.register(helmet);
await app.register(cors,{origin:env.CORS_ORIGIN.split(',').map(x=>x.trim()),credentials:true});
await app.register(rateLimit,{max:120,timeWindow:'1 minute'});

type User={id:string;email:string;roles:string[];permissions:string[]};
declare module 'fastify'{interface FastifyRequest{user?:User}}

const sign=(id:string,email:string)=>jwt.sign({sub:id,email},env.JWT_SECRET,{expiresIn:env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']});

async function auth(req:any,rep:any){
 const h=req.headers.authorization;
 if(!h?.startsWith('Bearer ')) return rep.code(401).send({success:false,error:{code:'UNAUTHENTICATED',message:'Authentication required'}});
 try{
  const p=jwt.verify(h.slice(7),env.JWT_SECRET) as jwt.JwtPayload;
  const u=await db.query<any>('SELECT id,email,status FROM users WHERE id=$1',[p.sub]);
  if(!u.rowCount||u.rows[0].status!=='active') throw new Error();
  const g=await db.query<any>('SELECT r.name,p.code FROM user_roles ur JOIN roles r ON r.id=ur.role_id LEFT JOIN role_permissions rp ON rp.role_id=r.id LEFT JOIN permissions p ON p.id=rp.permission_id WHERE ur.user_id=$1',[p.sub]);
  req.user={id:u.rows[0].id,email:u.rows[0].email,roles:[...new Set(g.rows.map(x=>x.name))],permissions:[...new Set(g.rows.map(x=>x.code).filter(Boolean))]};
 }catch{return rep.code(401).send({success:false,error:{code:'INVALID_TOKEN',message:'Invalid or expired token'}})}
}
const permit=(p:string)=>async(req:any,rep:any)=>{
 if(!req.user)return rep.code(401).send({success:false,error:{code:'UNAUTHENTICATED',message:'Authentication required'}});
 if(!req.user.permissions.includes(p)&&!req.user.roles.includes('super_admin'))return rep.code(403).send({success:false,error:{code:'FORBIDDEN',message:'Insufficient permission'}});
};

app.get('/health',async()=>({ok:true,service:'sfi-cusat-backend',time:new Date().toISOString()}));

app.post('/api/auth/register',async(req,rep)=>{
 const b=z.object({email:z.string().email(),password:z.string().min(8),fullName:z.string().min(2),rollNumber:z.string().optional()}).parse(req.body);
 const roll=b.rollNumber?.trim().toLowerCase()||null;
 if(roll&&(await db.query('SELECT 1 FROM student_profiles WHERE normalized_roll_number=$1',[roll])).rowCount)return rep.code(409).send({success:false,error:{code:'ROLL_NUMBER_EXISTS',message:'This roll number is already registered. Please sign in.'}});
 try{
  const u=(await db.query<any>('INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id,email',[b.email.toLowerCase(),await bcrypt.hash(b.password,12)])).rows[0];
  await db.query('INSERT INTO profiles(user_id,full_name) VALUES($1,$2)',[u.id,b.fullName]);
  await db.query('INSERT INTO student_profiles(user_id,normalized_roll_number) VALUES($1,$2)',[u.id,roll]);
  const role=await db.query<any>('SELECT id FROM roles WHERE name=$1',['student']);
  if(role.rowCount)await db.query('INSERT INTO user_roles(user_id,role_id,module) VALUES($1,$2,$3)',[u.id,role.rows[0].id,'platform']);
  return rep.code(201).send({success:true,data:{user:u,token:sign(u.id,u.email)}});
 }catch(e:any){if(e.code==='23505')return rep.code(409).send({success:false,error:{code:'EMAIL_EXISTS',message:'An account with this email already exists.'}});throw e}
});

app.post('/api/auth/login',async(req,rep)=>{
 const b=z.object({email:z.string().email(),password:z.string()}).parse(req.body);
 const r=await db.query<any>('SELECT id,email,password_hash,status FROM users WHERE email=$1',[b.email.toLowerCase()]);
 if(!r.rowCount||!(await bcrypt.compare(b.password,r.rows[0].password_hash)))return rep.code(401).send({success:false,error:{code:'INVALID_CREDENTIALS',message:'Invalid email or password'}});
 if(r.rows[0].status!=='active')return rep.code(403).send({success:false,error:{code:'ACCOUNT_DISABLED',message:'This account is not active'}});
 return {success:true,data:{user:{id:r.rows[0].id,email:r.rows[0].email},token:sign(r.rows[0].id,r.rows[0].email)}};
});

app.get('/api/me',{preHandler:auth},async req=>{
 const r=await db.query<any>('SELECT u.id,u.email,p.full_name,p.display_name,p.phone,sp.student_id,sp.normalized_roll_number,sp.programme,sp.semester,sp.department_id FROM users u LEFT JOIN profiles p ON p.user_id=u.id LEFT JOIN student_profiles sp ON sp.user_id=u.id WHERE u.id=$1',[req.user!.id]);
 return {success:true,data:r.rows[0]||null};
});
app.get('/api/departments',async()=>({success:true,data:(await db.query("SELECT * FROM departments WHERE status='verified' ORDER BY name")).rows}));

app.post('/api/academic/departments',{preHandler:[auth,permit('department.create')]},async(req,rep)=>{
 const b=z.object({name:z.string().min(2),shortName:z.string().optional(),officialEmail:z.string().email().optional(),website:z.string().url().optional(),building:z.string().optional(),phone:z.string().optional()}).parse(req.body);
 const r=await db.query<any>('INSERT INTO departments(name,short_name,official_email,website,building,phone,created_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[b.name,b.shortName,b.officialEmail,b.website,b.building,b.phone,req.user!.id]);
 return rep.code(201).send({success:true,data:r.rows[0]});
});

app.get('/api/academic/exams',async()=>({success:true,data:(await db.query("SELECT * FROM exams WHERE status<>'archived' ORDER BY starts_at")).rows}));
app.post('/api/academic/exams',{preHandler:[auth,permit('cbt.create')]},async(req,rep)=>{
 const b=z.object({departmentId:z.string().uuid().optional(),title:z.string().min(2),description:z.string().optional(),instructions:z.string().optional(),startsAt:z.string().datetime(),endsAt:z.string().datetime(),durationMinutes:z.number().int().positive(),attemptsAllowed:z.number().int().positive().default(1),negativeMarkingEnabled:z.boolean().default(false),negativeMarkingValue:z.number().nonnegative().default(0),accessType:z.enum(['public','invite','code']).default('public')}).parse(req.body);
 const r=await db.query<any>('INSERT INTO exams(department_id,coordinator_id,title,description,instructions,starts_at,ends_at,duration_minutes,attempts_allowed,negative_marking_enabled,negative_marking_value,access_type) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',[b.departmentId,req.user!.id,b.title,b.description,b.instructions,b.startsAt,b.endsAt,b.durationMinutes,b.attemptsAllowed,b.negativeMarkingEnabled,b.negativeMarkingValue,b.accessType]);
 return rep.code(201).send({success:true,data:r.rows[0]});
});

app.post('/api/cbt/exams/:id/register',{preHandler:auth},async(req,rep)=>{
 const id=(req.params as any).id;
 const r=await db.query<any>('INSERT INTO exam_registrations(exam_id,user_id,candidate_name,candidate_identifier) SELECT $1,$2,p.full_name,sp.normalized_roll_number FROM profiles p LEFT JOIN student_profiles sp ON sp.user_id=p.user_id WHERE p.user_id=$2 ON CONFLICT(exam_id,user_id) DO NOTHING RETURNING *',[id,req.user!.id]);
 return rep.code(r.rowCount?201:200).send({success:true,data:r.rows[0]||null});
});

app.post('/api/helpdesk/tickets',{preHandler:auth},async(req,rep)=>{
 const b=req.body as any;const r=await db.query<any>('INSERT INTO helpdesk_tickets(created_by,category,subcategory,title,description,priority) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[req.user!.id,b.category,b.subcategory,b.title,b.description,b.priority||'normal']);return rep.code(201).send({success:true,data:r.rows[0]});
});
app.post('/api/aashraya/requests',{preHandler:auth},async(req,rep)=>{
 const b=req.body as any;const r=await db.query<any>('INSERT INTO blood_requests(created_by,patient_name,blood_group,hospital,location,urgency,units_required,needed_at,contact_method) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',[req.user!.id,b.patientName,b.bloodGroup,b.hospital,b.location,b.urgency||'normal',b.unitsRequired||1,b.neededAt,b.contactMethod]);return rep.code(201).send({success:true,data:r.rows[0]});
});
app.post('/api/sahayi/requests',{preHandler:auth},async(req,rep)=>{
 const b=req.body as any;const r=await db.query<any>('INSERT INTO scribe_requests(requester_id,event_name,exam_date,start_time,location,requirements) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[req.user!.id,b.eventName,b.examDate,b.startTime,b.location,b.requirements]);return rep.code(201).send({success:true,data:r.rows[0]});
});
app.post('/api/samskara/events',{preHandler:auth},async(req,rep)=>{
 const b=req.body as any;const r=await db.query<any>('INSERT INTO events(title,description,category,starts_at,ends_at,venue,registration_open,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[b.title,b.description,b.category,b.startsAt,b.endsAt,b.venue,b.registrationOpen||false,req.user!.id]);return rep.code(201).send({success:true,data:r.rows[0]});
});
app.get('/api/scholarx/opportunities',async()=>({success:true,data:(await db.query("SELECT * FROM opportunities WHERE status='approved' ORDER BY deadline NULLS LAST")).rows}));

app.setErrorHandler((e,req,rep)=>{req.log.error(e);if(e.name==='ZodError')return rep.code(400).send({success:false,error:{code:'VALIDATION_ERROR',message:'Invalid request data',details:(e as any).issues}});return rep.code(500).send({success:false,error:{code:'INTERNAL_ERROR',message:'Internal server error'}})});
await app.listen({port:env.PORT,host:env.HOST});
