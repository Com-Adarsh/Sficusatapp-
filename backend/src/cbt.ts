import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { Pool } from 'pg';

const examId=z.object({id:z.string().uuid()});
const attemptIdSchema=z.object({attemptId:z.string().uuid()});
const qBody=z.object({questionText:z.string().min(1),position:z.number().int().positive(),marks:z.number().positive().default(1),negativeMarks:z.number().nonnegative().default(0),options:z.array(z.object({key:z.string().min(1),text:z.string().min(1),position:z.number().int()})).min(2)});
const keyBody=z.object({entries:z.array(z.object({questionId:z.string().uuid(),correctOption:z.string().min(1),marks:z.number().positive(),negativeMarks:z.number().nonnegative().default(0)})).min(1)});

export async function registerCbt(app:FastifyInstance,db:Pool,auth:any,permit:any){
 app.post('/api/cbt/exams/:id/questions',{preHandler:[auth,permit('cbt.question.manage')]},async(req,rep)=>{
  const {id}=examId.parse(req.params);const b=qBody.parse(req.body);
  const exam=(await db.query<any>('SELECT id,coordinator_id FROM exams WHERE id=$1',[id])).rows[0];
  if(!exam||exam.coordinator_id!==req.user.id)return rep.code(403).send({success:false,error:{code:'FORBIDDEN',message:'You do not manage this exam'}});
  let bank=(await db.query<any>('SELECT id FROM question_banks WHERE title=$1 AND owner_user_id=$2 LIMIT 1',['Exam '+id,req.user.id])).rows[0];
  if(!bank)bank=(await db.query<any>('INSERT INTO question_banks(owner_user_id,title,source_type) VALUES($1,$2,$3) RETURNING id',[req.user.id,'Exam '+id,'manual'])).rows[0];
  const q=(await db.query<any>('INSERT INTO questions(question_bank_id,question_text,marks,negative_marks,position) VALUES($1,$2,$3,$4,$5) RETURNING *',[bank.id,b.questionText,b.marks,b.negativeMarks,b.position])).rows[0];
  for(const o of b.options)await db.query('INSERT INTO question_options(question_id,option_key,option_text,position) VALUES($1,$2,$3,$4)',[q.id,o.key,o.text,o.position]);
  await db.query('INSERT INTO exam_questions(exam_id,question_id,position) VALUES($1,$2,$3)',[id,q.id,b.position]);
  return rep.code(201).send({success:true,data:q});
 });
 app.post('/api/cbt/exams/:id/answer-key',{preHandler:[auth,permit('cbt.question.manage')]},async(req,rep)=>{
  const {id}=examId.parse(req.params);const b=keyBody.parse(req.body);
  const exam=(await db.query<any>('SELECT id,coordinator_id,status FROM exams WHERE id=$1',[id])).rows[0];
  if(!exam||exam.coordinator_id!==req.user.id)return rep.code(403).send({success:false,error:{code:'FORBIDDEN',message:'You do not manage this exam'}});
  if(['live','closed','evaluation','results_ready','archived'].includes(exam.status))return rep.code(409).send({success:false,error:{code:'ANSWER_KEY_LOCKED',message:'Answer key cannot be changed after the examination starts'}});
  const n=Number((await db.query<any>('SELECT COALESCE(MAX(version),0)+1 AS n FROM answer_key_versions WHERE exam_id=$1',[id])).rows[0].n);
  const key=(await db.query<any>('INSERT INTO answer_key_versions(exam_id,version,created_by) VALUES($1,$2,$3) RETURNING *',[id,n,req.user.id])).rows[0];
  for(const e of b.entries)await db.query('INSERT INTO answer_key_entries(answer_key_version_id,question_id,correct_option,marks,negative_marks) VALUES($1,$2,$3,$4,$5)',[key.id,e.questionId,e.correctOption,e.marks,e.negativeMarks]);
  return rep.code(201).send({success:true,data:key});
 });
 app.post('/api/cbt/answer-keys/:id/lock',{preHandler:[auth,permit('cbt.publish')]},async(req,rep)=>{
  const id=(req.params as any).id;
  const r=await db.query<any>("UPDATE answer_key_versions SET status='locked',locked_at=now() WHERE id=$1 AND created_by=$2 AND status='draft' RETURNING *",[id,req.user.id]);
  if(!r.rowCount)return rep.code(409).send({success:false,error:{code:'KEY_NOT_LOCKABLE',message:'Answer key not found or already locked'}});
  return {success:true,data:r.rows[0]};
 });
 app.post('/api/cbt/exams/:id/publish',{preHandler:[auth,permit('cbt.publish')]},async(req,rep)=>{
  const {id}=examId.parse(req.params);
  const exam=(await db.query<any>('SELECT * FROM exams WHERE id=$1 AND coordinator_id=$2',[id,req.user.id])).rows[0];
  const key=(await db.query<any>("SELECT id FROM answer_key_versions WHERE exam_id=$1 AND status='locked' ORDER BY version DESC LIMIT 1",[id])).rows[0];
  if(!exam)return rep.code(404).send({success:false,error:{code:'EXAM_NOT_FOUND',message:'Exam not found'}});
  if(!key)return rep.code(409).send({success:false,error:{code:'ANSWER_KEY_NOT_LOCKED',message:'Lock an answer key before publishing'}});
  const r=await db.query<any>("UPDATE exams SET status='scheduled',published_at=now() WHERE id=$1 RETURNING *",[id]);
  return {success:true,data:r.rows[0]};
 });
 app.post('/api/cbt/exams/:id/attempts',{preHandler:auth},async(req,rep)=>{
  const {id}=examId.parse(req.params);const c=await db.connect();
  try{
   await c.query('BEGIN');
   const exam=(await c.query<any>('SELECT * FROM exams WHERE id=$1 FOR UPDATE',[id])).rows[0];
   if(!exam){await c.query('ROLLBACK');return rep.code(404).send({success:false,error:{code:'EXAM_NOT_FOUND',message:'Exam not found'}})}
   const now=Date.now();if(now<new Date(exam.starts_at).getTime()||now>=new Date(exam.ends_at).getTime()){await c.query('ROLLBACK');return rep.code(409).send({success:false,error:{code:'EXAM_NOT_LIVE',message:'Exam is not live'}})}
   const reg=(await c.query<any>("SELECT * FROM exam_registrations WHERE exam_id=$1 AND user_id=$2 AND status='registered'",[id,req.user.id])).rows[0];
   if(!reg){await c.query('ROLLBACK');return rep.code(409).send({success:false,error:{code:'NOT_REGISTERED',message:'Register before starting the exam'}})}
   const count=Number((await c.query<any>('SELECT count(*)::int n FROM exam_attempts WHERE registration_id=$1',[reg.id])).rows[0].n);
   if(count>=exam.attempts_allowed){await c.query('ROLLBACK');return rep.code(409).send({success:false,error:{code:'ATTEMPTS_EXHAUSTED',message:'No attempts remaining'}})}
   const key=(await c.query<any>("SELECT id FROM answer_key_versions WHERE exam_id=$1 AND status='locked' ORDER BY version DESC LIMIT 1",[id])).rows[0];
   if(!key){await c.query('ROLLBACK');return rep.code(409).send({success:false,error:{code:'ANSWER_KEY_NOT_READY',message:'The examination is not ready'}})}
   const expires=new Date(Math.min(now+exam.duration_minutes*60000,new Date(exam.ends_at).getTime()));
   const a=(await c.query<any>('INSERT INTO exam_attempts(exam_id,registration_id,user_id,attempt_number,started_at,expires_at,answer_key_version_id) VALUES($1,$2,$3,$4,now(),$5,$6) RETURNING *',[id,reg.id,req.user.id,count+1,expires,key.id])).rows[0];
   await c.query('COMMIT');return rep.code(201).send({success:true,data:a});
  }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
 });
 app.put('/api/cbt/attempts/:attemptId/answers/:questionId',{preHandler:auth},async(req,rep)=>{
  const p=req.params as any;const b=z.object({selectedOption:z.string().nullable(),markForReview:z.boolean().default(false)}).parse(req.body);
  const a=(await db.query<any>('SELECT * FROM exam_attempts WHERE id=$1 AND user_id=$2',[p.attemptId,req.user.id])).rows[0];
  if(!a)return rep.code(404).send({success:false,error:{code:'ATTEMPT_NOT_FOUND',message:'Attempt not found'}});
  if(a.status!=='active'||new Date(a.expires_at)<=new Date())return rep.code(409).send({success:false,error:{code:'ATTEMPT_EXPIRED',message:'Attempt is no longer active'}});
  if(!(await db.query('SELECT 1 FROM exam_questions WHERE exam_id=$1 AND question_id=$2',[a.exam_id,p.questionId])).rowCount)return rep.code(400).send({success:false,error:{code:'QUESTION_NOT_IN_EXAM',message:'Question is not in this exam'}});
  const r=await db.query<any>('INSERT INTO attempt_answers(attempt_id,question_id,selected_option,is_marked_for_review,answered_at) VALUES($1,$2,$3,$4,CASE WHEN $3 IS NULL THEN NULL ELSE now() END) ON CONFLICT(attempt_id,question_id) DO UPDATE SET selected_option=EXCLUDED.selected_option,is_marked_for_review=EXCLUDED.is_marked_for_review,answered_at=EXCLUDED.answered_at,updated_at=now() RETURNING *',[p.attemptId,p.questionId,b.selectedOption,b.markForReview]);
  return {success:true,data:r.rows[0]};
 });
 app.post('/api/cbt/attempts/:attemptId/submit',{preHandler:auth},async(req,rep)=>{
  const {attemptId}=attemptIdSchema.parse(req.params);
  const a=(await db.query<any>('SELECT * FROM exam_attempts WHERE id=$1 AND user_id=$2',[attemptId,req.user.id])).rows[0];
  if(!a)return rep.code(404).send({success:false,error:{code:'ATTEMPT_NOT_FOUND',message:'Attempt not found'}});
  if(a.status!=='active')return rep.code(409).send({success:false,error:{code:'ATTEMPT_ALREADY_CLOSED',message:'Attempt already closed'}});
  await db.query('UPDATE exam_attempts SET submitted_at=now() WHERE id=$1',[attemptId]);
  const key=await db.query<any>('SELECT question_id,correct_option,marks,negative_marks FROM answer_key_entries WHERE answer_key_version_id=$1',[a.answer_key_version_id]);
  const answers=new Map((await db.query<any>('SELECT question_id,selected_option FROM attempt_answers WHERE attempt_id=$1',[attemptId])).rows.map(x=>[x.question_id,x.selected_option]));
  let score=0,total=0,correct=0,wrong=0,skipped=0;
  for(const k of key.rows){total+=Number(k.marks);const selected=answers.get(k.question_id);if(!selected){skipped++;continue}if(selected===k.correct_option){correct++;score+=Number(k.marks)}else{wrong++;score-=Number(k.negative_marks||0)}}
  const seconds=Math.max(0,Math.floor((Date.now()-new Date(a.started_at).getTime())/1000));
  await db.query("UPDATE exam_attempts SET status='submitted',score=$1,correct_count=$2,wrong_count=$3,skipped_count=$4,time_taken_seconds=$5 WHERE id=$6",[score,correct,wrong,skipped,seconds,attemptId]);
  const result=(await db.query<any>('INSERT INTO exam_results(attempt_id,exam_id,user_id,score,total_marks,correct_count,wrong_count,skipped_count,time_taken_seconds) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(attempt_id) DO UPDATE SET score=EXCLUDED.score RETURNING *',[attemptId,a.exam_id,a.user_id,score,total,correct,wrong,skipped,seconds])).rows[0];
  return {success:true,data:result};
 });
}
