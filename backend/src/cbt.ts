import {FastifyInstance,FastifyReply,FastifyRequest} from 'fastify';
import {Pool,PoolClient} from 'pg';
import {z} from 'zod';
import {AuthUser} from './server.js';

type Ctx={authenticate:(r:FastifyRequest,p:FastifyReply)=>Promise<any>,requirePermission:(p:string)=>(r:FastifyRequest,p2:FastifyReply)=>Promise<any>,audit:(actor:string,action:string,type:string,id:string|null,b?:any,a?:any)=>Promise<void>};

const examInput=z.object({
 departmentId:z.string().uuid().optional(),title:z.string().trim().min(2).max(200),description:z.string().max(5000).optional(),instructions:z.string().max(10000).optional(),
 registrationOpenAt:z.string().datetime().optional(),registrationCloseAt:z.string().datetime().optional(),startsAt:z.string().datetime(),endsAt:z.string().datetime(),
 durationMinutes:z.number().int().positive().max(1440),attemptsAllowed:z.number().int().positive().max(10).default(1),
 negativeMarkingEnabled:z.boolean().default(false),negativeMarkingValue:z.number().min(0).max(100).default(0),
 accessType:z.enum(['public','invite','code']).default('public'),accessCode:z.string().min(4).max(100).optional()
});
const questionInput=z.object({
 questionBankId:z.string().uuid(),questionType:z.enum(['single_choice','multiple_choice','true_false']).default('single_choice'),
 questionText:z.string().trim().min(1).max(10000),marks:z.number().positive().max(1000).default(1),negativeMarks:z.number().min(0).max(1000).default(0),
 difficulty:z.string().max(30).optional(),position:z.number().int().positive(),options:z.array(z.object({key:z.string().min(1).max(10),text:z.string().min(1).max(2000)})).min(2).max(10)
});
const answerInput=z.object({questionId:z.string().uuid(),correctOption:z.string().min(1).max(10).optional(),correctOptions:z.array(z.string().min(1).max(10)).min(1).max(10).optional(),marks:z.number().positive().max(1000),negativeMarks:z.number().min(0).max(1000).default(0)}).refine(v=>Boolean(v.correctOptions?.length||v.correctOption),{message:'correctOption or correctOptions is required'});
const idParam=z.object({id:z.string().uuid()});

async function ownsExam(db:Pool,examId:string,user:AuthUser,write=false){
 const r=await db.query('SELECT e.* FROM exams e WHERE e.id=$1',[examId]);
 if(!r.rowCount)return {ok:false,status:404 as const,error:'Exam not found'};
 const e=r.rows[0]; if(user.roles.includes('super_admin')||user.roles.includes('admin')||user.permissions.includes('cbt.manage')&&e.coordinator_id===user.id)return {ok:true,exam:e};
 return {ok:false,status:403 as const,error:'You do not control this examination'};
}

export function registerCbtRoutes(app:FastifyInstance,db:Pool,ctx:Ctx){
 const coordinator=ctx.requirePermission('cbt.create');
 const manager=ctx.requirePermission('cbt.manage'); const publisher=ctx.requirePermission('cbt.publish');

 app.post('/api/cbt/question-banks',{preHandler:ctx.requirePermission('cbt.question.manage')},async(req,reply)=>{
  const b=z.object({title:z.string().trim().min(2).max(200),description:z.string().max(5000).optional(),departmentId:z.string().uuid().optional(),sourceType:z.enum(['pdf','csv','xlsx','json','manual']).default('manual')}).parse(req.body);
  const r=await db.query('INSERT INTO question_banks(owner_user_id,department_id,title,description,source_type) VALUES($1,$2,$3,$4,$5) RETURNING *',[req.user!.id,b.departmentId??null,b.title,b.description??null,b.sourceType]);
  await ctx.audit(req.user!.id,'cbt.question_bank.create','question_bank',r.rows[0].id,null,r.rows[0]);
  return reply.code(201).send({questionBank:r.rows[0]});
 });

 app.get('/api/cbt/question-banks',{preHandler:ctx.requirePermission('cbt.question.manage')},async(req)=>{
  const r=await db.query('SELECT id,title,description,department_id,source_type,created_at FROM question_banks WHERE owner_user_id=$1 OR $2=ANY(ARRAY[]::text[]) ORDER BY created_at DESC',[req.user!.id,'never']);
  return {questionBanks:r.rows};
 });

 app.post('/api/cbt/exams',{preHandler:coordinator},async(req,reply)=>{
  const b=examInput.parse(req.body);
  if(new Date(b.endsAt)<=new Date(b.startsAt))return reply.code(400).send({error:'endsAt must be after startsAt'});
  if(b.registrationCloseAt&&new Date(b.registrationCloseAt)>new Date(b.startsAt))return reply.code(400).send({error:'Registration must close before the exam starts'});
  if(b.accessType==='code'&&!b.accessCode)return reply.code(400).send({error:'accessCode is required for code-protected exams'});
  const r=await db.query('INSERT INTO exams(department_id,coordinator_id,title,description,instructions,registration_open_at,registration_close_at,starts_at,ends_at,duration_minutes,attempts_allowed,negative_marking_enabled,negative_marking_value,access_type,access_code) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *',[b.departmentId??null,req.user!.id,b.title,b.description??null,b.instructions??null,b.registrationOpenAt??null,b.registrationCloseAt??null,b.startsAt,b.endsAt,b.durationMinutes,b.attemptsAllowed,b.negativeMarkingEnabled,b.negativeMarkingValue,b.accessType,b.accessCode??null]);
  await ctx.audit(req.user!.id,'cbt.exam.create','exam',r.rows[0].id,null,r.rows[0]); return reply.code(201).send({exam:r.rows[0]});
 });

 app.get('/api/cbt/exams/:id',async(req,reply)=>{
  const {id}=idParam.parse(req.params); const r=await db.query(`SELECT e.id,e.title,e.description,e.instructions,e.starts_at,e.ends_at,e.duration_minutes,e.attempts_allowed,e.negative_marking_enabled,e.access_type,e.status,d.name department_name, count(eq.question_id)::int question_count
    FROM exams e LEFT JOIN departments d ON d.id=e.department_id LEFT JOIN exam_questions eq ON eq.exam_id=e.id WHERE e.id=$1 GROUP BY e.id,d.name`,[id]);
  if(!r.rowCount)return reply.code(404).send({error:'Exam not found'}); return {exam:r.rows[0]};
 });

 app.post('/api/cbt/exams/:id/questions',{preHandler:manager},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const own=await ownsExam(db,id,req.user!); if(!own.ok)return reply.code(own.status).send({error:own.error});
  if(['live','closed','evaluation','results_ready','archived'].includes(own.exam.status))return reply.code(409).send({error:'Questions are locked for this exam status'});
  const b=questionInput.parse(req.body); const c=await db.connect();
  try{
   await c.query('BEGIN');
   const q=await c.query('INSERT INTO questions(question_bank_id,question_type,question_text,marks,negative_marks,difficulty,position) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[b.questionBankId,b.questionType,b.questionText,b.marks,b.negativeMarks,b.difficulty??null,b.position]);
   for(const o of b.options)await c.query('INSERT INTO question_options(question_id,option_key,option_text,position) VALUES($1,$2,$3,$4)',[q.rows[0].id,o.key,o.text,b.options.indexOf(o)+1]);
   await c.query('INSERT INTO exam_questions(exam_id,question_id,position) VALUES($1,$2,$3)',[id,q.rows[0].id,b.position]);
   await c.query('COMMIT'); await ctx.audit(req.user!.id,'cbt.question.create','question',q.rows[0].id,null,q.rows[0]);
   return reply.code(201).send({question:q.rows[0]});
  }catch(e){await c.query('ROLLBACK');if((e as any)?.code==='23505')return reply.code(409).send({error:'Question position or option key already exists'});throw e}finally{c.release();}
 });

 app.post('/api/cbt/exams/:id/answer-key',{preHandler:manager},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const own=await ownsExam(db,id,req.user!); if(!own.ok)return reply.code(own.status).send({error:own.error});
  const b=z.object({entries:z.array(answerInput).min(1)}).parse(req.body);
  const existing=await db.query('SELECT COALESCE(MAX(version),0)+1 version FROM answer_key_versions WHERE exam_id=$1',[id]);
  const c=await db.connect();
  try{await c.query('BEGIN');const v=await c.query('INSERT INTO answer_key_versions(exam_id,version,created_by) VALUES($1,$2,$3) RETURNING *',[id,existing.rows[0].version,req.user!.id]);
   for(const x of b.entries){const options=[...(x.correctOptions??[x.correctOption!])];await c.query('INSERT INTO answer_key_entries(answer_key_version_id,question_id,correct_option,correct_options,marks,negative_marks) VALUES($1,$2,$3,$4,$5,$6)',[v.rows[0].id,x.questionId,options[0],options,x.marks,x.negativeMarks]);}
   await c.query('COMMIT');return reply.code(201).send({answerKey:v.rows[0]});
  }catch(e){await c.query('ROLLBACK');throw e}finally{c.release();}
 });

 app.post('/api/cbt/exams/:id/answer-key/:versionId/lock',{preHandler:manager},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const versionId=z.object({versionId:z.string().uuid()}).parse(req.params).versionId; const own=await ownsExam(db,id,req.user!); if(!own.ok)return reply.code(own.status).send({error:own.error});
  const r=await db.query("UPDATE answer_key_versions SET status='locked',locked_at=now() WHERE id=$1 AND exam_id=$2 AND status='draft' RETURNING *",[versionId,id]);
  if(!r.rowCount)return reply.code(409).send({error:'Answer key not found or already locked'}); return {answerKey:r.rows[0]};
 });

 app.post('/api/cbt/exams/:id/publish',{preHandler:publisher},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const own=await ownsExam(db,id,req.user!); if(!own.ok)return reply.code(own.status).send({error:own.error});
  const key=await db.query("SELECT id FROM answer_key_versions WHERE exam_id=$1 AND status='locked' ORDER BY version DESC LIMIT 1",[id]);
  const questions=await db.query('SELECT count(*)::int n FROM exam_questions WHERE exam_id=$1',[id]);
  if(!key.rowCount||!questions.rows[0].n)return reply.code(409).send({error:'Publish requires at least one question and a locked answer key'});
  const r=await db.query("UPDATE exams SET status='scheduled',published_at=now(),updated_at=now() WHERE id=$1 AND status IN ('draft','review','scheduled') RETURNING *",[id]);
  if(!r.rowCount)return reply.code(409).send({error:'Exam cannot be published from its current status'}); return {exam:r.rows[0]};
 });

 app.post('/api/cbt/exams/:id/register',{preHandler:ctx.authenticate},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const b=z.object({candidateName:z.string().trim().min(2).max(120).optional(),candidateIdentifier:z.string().max(100).optional(),accessCode:z.string().optional()}).parse(req.body);
  const e=(await db.query('SELECT * FROM exams WHERE id=$1',[id])).rows[0]; if(!e)return reply.code(404).send({error:'Exam not found'});
  const now=new Date(); const registrationOpen=e.registration_open_at?now>=new Date(e.registration_open_at):true; const registrationClosed=e.registration_close_at?now>new Date(e.registration_close_at):now>=new Date(e.starts_at); if(!['scheduled','registration_open'].includes(e.status)||!registrationOpen||registrationClosed)return reply.code(409).send({error:'Registration is closed'});
  if(e.access_type==='code'&&b.accessCode!==e.access_code)return reply.code(403).send({error:'Invalid examination code'});
  const n=await db.query('SELECT count(*)::int n FROM exam_registrations WHERE exam_id=$1 AND user_id=$2 AND status=\'registered\'',[id,req.user!.id]);
  if(n.rows[0].n>=1)return {message:'Already registered',registration:(await db.query('SELECT * FROM exam_registrations WHERE exam_id=$1 AND user_id=$2',[id,req.user!.id])).rows[0]};
  const r=await db.query('INSERT INTO exam_registrations(exam_id,user_id,candidate_name,candidate_identifier) VALUES($1,$2,$3,$4) RETURNING *',[id,req.user!.id,b.candidateName??req.user!.email,b.candidateIdentifier??null]);
  return reply.code(201).send({registration:r.rows[0]});
 });

 app.post('/api/cbt/exams/:id/start',{preHandler:ctx.authenticate},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const e=(await db.query('SELECT * FROM exams WHERE id=$1',[id])).rows[0]; if(!e)return reply.code(404).send({error:'Exam not found'});
  const now=new Date(); if(now<new Date(e.starts_at)||now>new Date(e.ends_at))return reply.code(409).send({error:'Exam is not currently live'});
  const reg=(await db.query("SELECT * FROM exam_registrations WHERE exam_id=$1 AND user_id=$2 AND status='registered'",[id,req.user!.id])).rows[0]; if(!reg)return reply.code(403).send({error:'Register for the examination first'});
  const count=(await db.query("SELECT count(*)::int n FROM exam_attempts WHERE exam_id=$1 AND registration_id=$2 AND status<>'invalidated'",[id,reg.id])).rows[0].n;
  if(count>=e.attempts_allowed)return reply.code(409).send({error:'Attempt limit reached'});
  const active=(await db.query("SELECT * FROM exam_attempts WHERE exam_id=$1 AND registration_id=$2 AND status='active'",[id,reg.id])).rows[0]; if(active)return {attempt:active};
  const key=(await db.query("SELECT id FROM answer_key_versions WHERE exam_id=$1 AND status='locked' ORDER BY version DESC LIMIT 1",[id])).rows[0]; if(!key)return reply.code(409).send({error:'Answer key is not ready'});
  const expires=new Date(Math.min(now.getTime()+e.duration_minutes*60000,new Date(e.ends_at).getTime()));
  const r=await db.query('INSERT INTO exam_attempts(exam_id,registration_id,user_id,attempt_number,started_at,expires_at,answer_key_version_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[id,reg.id,req.user!.id,count+1,now,expires,key.id]);
  return reply.code(201).send({attempt:r.rows[0],serverTime:now.toISOString()});
 });

 app.get('/api/cbt/attempts/:id/questions',{preHandler:ctx.authenticate},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const a=(await db.query('SELECT * FROM exam_attempts WHERE id=$1 AND user_id=$2',[id,req.user!.id])).rows[0]; if(!a)return reply.code(404).send({error:'Attempt not found'});
  if(a.status!=='active')return reply.code(409).send({error:'Attempt is no longer active'});
  if(new Date()>new Date(a.expires_at))return reply.code(409).send({error:'Attempt has expired'});
  const r=await db.query(`SELECT q.id,q.question_type,q.question_text,q.marks,q.negative_marks,eq.position,
      COALESCE(json_agg(json_build_object('key',qo.option_key,'text',qo.option_text) ORDER BY qo.position) FILTER(WHERE qo.id IS NOT NULL),'[]') options,
      aa.selected_option,aa.is_marked_for_review
    FROM exam_questions eq JOIN questions q ON q.id=eq.question_id LEFT JOIN question_options qo ON qo.question_id=q.id
    LEFT JOIN attempt_answers aa ON aa.question_id=q.id AND aa.attempt_id=$1 WHERE eq.exam_id=$2
    GROUP BY q.id,eq.position,aa.selected_option,aa.is_marked_for_review ORDER BY eq.position`,[id,a.exam_id]);
  return {attempt:{id:a.id,startedAt:a.started_at,expiresAt:a.expires_at},questions:r.rows};
 });

 app.put('/api/cbt/attempts/:id/answers',{preHandler:ctx.authenticate},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const b=z.object({questionId:z.string().uuid(),selectedOption:z.string().max(20).nullable(),markedForReview:z.boolean().default(false)}).parse(req.body);
  const a=(await db.query('SELECT * FROM exam_attempts WHERE id=$1 AND user_id=$2',[id,req.user!.id])).rows[0]; if(!a)return reply.code(404).send({error:'Attempt not found'});
  if(a.status!=='active')return reply.code(409).send({error:'Attempt is not active'}); if(new Date()>new Date(a.expires_at))return reply.code(409).send({error:'Attempt has expired'});
  const valid=await db.query('SELECT 1 FROM exam_questions WHERE exam_id=$1 AND question_id=$2',[a.exam_id,b.questionId]); if(!valid.rowCount)return reply.code(400).send({error:'Question is not part of this exam'});
  if(b.selectedOption!==null){const opt=await db.query('SELECT 1 FROM question_options WHERE question_id=$1 AND option_key=$2',[b.questionId,b.selectedOption]);if(!opt.rowCount)return reply.code(400).send({error:'Invalid option'});}
  const r=await db.query(`INSERT INTO attempt_answers(attempt_id,question_id,selected_option,is_marked_for_review,answered_at) VALUES($1,$2,$3,$4,now())
    ON CONFLICT(attempt_id,question_id) DO UPDATE SET selected_option=EXCLUDED.selected_option,is_marked_for_review=EXCLUDED.is_marked_for_review,answered_at=now(),updated_at=now() RETURNING *`,[id,b.questionId,b.selectedOption,b.markedForReview]);
  return {answer:r.rows[0]};
 });

 app.post('/api/cbt/attempts/:id/submit',{preHandler:ctx.authenticate},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const c=await db.connect();
  try{
   await c.query('BEGIN');
   const a=(await c.query('SELECT * FROM exam_attempts WHERE id=$1 AND user_id=$2 FOR UPDATE',[id,req.user!.id])).rows[0]; if(!a){await c.query('ROLLBACK');return reply.code(404).send({error:'Attempt not found'});}
   if(a.status!=='active'){await c.query('ROLLBACK');return reply.code(409).send({error:'Attempt already submitted'});}
   const key=(await c.query('SELECT * FROM answer_key_versions WHERE id=$1 AND status=\'locked\'',[a.answer_key_version_id])).rows[0]; if(!key){await c.query('ROLLBACK');return reply.code(500).send({error:'Locked answer key unavailable'});}
   const rows=(await c.query(`SELECT eq.question_id,ake.correct_option,ake.correct_options,ake.marks,ake.negative_marks,aa.selected_option
      FROM exam_questions eq JOIN answer_key_entries ake ON ake.question_id=eq.question_id AND ake.answer_key_version_id=$1
      LEFT JOIN attempt_answers aa ON aa.question_id=eq.question_id AND aa.attempt_id=$2 WHERE eq.exam_id=$3`,[a.answer_key_version_id,id,a.exam_id])).rows;
   let score=0,correct=0,wrong=0,skipped=0; for(const x of rows){if(!x.selected_option){skipped++;continue} const expected=Array.isArray(x.correct_options)&&x.correct_options.length?x.correct_options:[x.correct_option]; const selected=String(x.selected_option); if(expected.length===1?selected===expected[0]:expected.includes(selected)){correct++;score+=Number(x.marks)}else{wrong++;score-=Number(x.negative_marks)}}
   score=Math.max(0,score); const submitted=new Date(); const elapsed=Math.max(0,Math.floor((submitted.getTime()-new Date(a.started_at).getTime())/1000)); const status=submitted>new Date(a.expires_at)?'expired':'submitted';
   const up=await c.query(`UPDATE exam_attempts SET submitted_at=$1,status=$2,score=$3,correct_count=$4,wrong_count=$5,skipped_count=$6,time_taken_seconds=$7 WHERE id=$8 RETURNING *`,[submitted,status,score,correct,wrong,skipped,Math.min(elapsed,Math.ceil((new Date(a.expires_at).getTime()-new Date(a.started_at).getTime())/1000)),id]);
   const total=rows.reduce((s,x)=>s+Number(x.marks),0);
   const result=await c.query('INSERT INTO exam_results(attempt_id,exam_id,user_id,score,total_marks,correct_count,wrong_count,skipped_count,time_taken_seconds) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(attempt_id) DO UPDATE SET score=EXCLUDED.score,total_marks=EXCLUDED.total_marks,correct_count=EXCLUDED.correct_count,wrong_count=EXCLUDED.wrong_count,skipped_count=EXCLUDED.skipped_count,time_taken_seconds=EXCLUDED.time_taken_seconds RETURNING *',[id,a.exam_id,req.user!.id,score,total,correct,wrong,skipped,up.rows[0].time_taken_seconds]);
   await c.query('COMMIT'); return {submitted:true,result:result.rows[0]};
  }catch(e){await c.query('ROLLBACK');throw e}finally{c.release();}
 });

 app.get('/api/cbt/exams/:id/results',{preHandler:ctx.requirePermission('cbt.results.read')},async(req,reply)=>{
  const {id}=idParam.parse(req.params); const own=await ownsExam(db,id,req.user!);if(!own.ok)return reply.code(own.status).send({error:own.error});
  const r=await db.query(`SELECT er.*,p.full_name,u.email,ep.candidate_identifier FROM exam_results er JOIN users u ON u.id=er.user_id LEFT JOIN profiles p ON p.user_id=u.id LEFT JOIN exam_registrations ep ON ep.id=(SELECT registration_id FROM exam_attempts WHERE id=er.attempt_id) WHERE er.exam_id=$1 ORDER BY er.score DESC,er.time_taken_seconds`,[id]);
  return {results:r.rows};
 });

 app.post('/api/cbt/exams/:id/release-results',{preHandler:ctx.requirePermission('cbt.results.read')},async(req,reply)=>{
  const {id}=idParam.parse(req.params);const own=await ownsExam(db,id,req.user!);if(!own.ok)return reply.code(own.status).send({error:own.error});
  const r=await db.query('UPDATE exam_results SET released_at=COALESCE(released_at,now()) WHERE exam_id=$1',[id]); return {released:true,count:r.rowCount};
 });
}
