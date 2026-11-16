import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { currentUser, requirePermission } from "./auth";

const option = v.object({ key: v.string(), text: v.string(), position: v.number() });
const answerEntry = v.object({ questionId: v.string(), correctOptions: v.array(v.string()), marks: v.number(), negativeMarks: v.number() });

export const createExam = mutation({
  args: {
    legacyId:v.string(), departmentId:v.optional(v.string()), title:v.string(), description:v.optional(v.string()),
    instructions:v.optional(v.string()), registrationOpenAt:v.optional(v.number()), registrationCloseAt:v.optional(v.number()),
    startsAt:v.number(), endsAt:v.number(), durationMinutes:v.number(), attemptsAllowed:v.number(),
    negativeMarkingEnabled:v.boolean(), negativeMarkingValue:v.number(), accessType:v.string(), accessCode:v.optional(v.string()),
  },
  handler:async(ctx,args)=>{
    const user=await requirePermission(ctx,"academic.cbt.create"); const now=Date.now();
    return await ctx.db.insert("exams",{...args,coordinatorId:user.legacyId,status:"draft",createdAt:now,updatedAt:now});
  },
});

export const publishExam = mutation({
  args:{examId:v.string()},
  handler:async(ctx,args)=>{
    const user=await requirePermission(ctx,"academic.cbt.publish");
    const e=await ctx.db.query("exams").withIndex("by_legacy_id",q=>q.eq("legacyId",args.examId)).unique();
    if(!e||e.coordinatorId!==user.legacyId) throw new Error("Forbidden");
    await ctx.db.patch(e._id,{status:"scheduled",publishedAt:Date.now(),updatedAt:Date.now()});
  },
});

export const listExams = query({
  args:{departmentId:v.optional(v.string())},
  handler:async(ctx,args)=>{
    const rows=args.departmentId
      ? await ctx.db.query("exams").withIndex("by_department",q=>q.eq("departmentId",args.departmentId!)).collect()
      : await ctx.db.query("exams").withIndex("by_status",q=>q.eq("status","scheduled")).collect();
    return rows.filter(e=>["scheduled","registration_open","live","closed","evaluation","results_ready"].includes(e.status)).sort((a,b)=>a.startsAt-b.startsAt);
  },
});

export const addQuestionBank = mutation({
  args:{legacyId:v.string(),departmentId:v.optional(v.string()),title:v.string(),description:v.optional(v.string()),sourceType:v.string()},
  handler:async(ctx,args)=>{
    const user=await requirePermission(ctx,"academic.cbt.manage"); const now=Date.now();
    return await ctx.db.insert("questionBanks",{...args,ownerUserId:user.legacyId,createdAt:now,updatedAt:now});
  },
});

export const addQuestion = mutation({
  args:{legacyId:v.string(),questionBankId:v.string(),questionType:v.string(),questionText:v.string(),marks:v.number(),negativeMarks:v.number(),difficulty:v.optional(v.string()),position:v.number(),options:v.array(option),examId:v.optional(v.string())},
  handler:async(ctx,args)=>{
    await requirePermission(ctx,"academic.cbt.manage"); const now=Date.now();
    const existing=await ctx.db.query("questions").withIndex("by_legacy_id",q=>q.eq("legacyId",args.legacyId)).unique();
    const {examId,...question}=args;
    const qid=existing ? (await ctx.db.patch(existing._id,{...question,updatedAt:now}),existing._id) : await ctx.db.insert("questions",{...question,createdAt:now,updatedAt:now});
    if(examId){
      const link=await ctx.db.query("examQuestions").withIndex("by_exam_position",q=>q.eq("examId",examId).eq("position",args.position)).unique();
      if(!link) await ctx.db.insert("examQuestions",{examId,questionId:args.legacyId,position:args.position,createdAt:now,updatedAt:now});
    }
    return qid;
  },
});

export const setAnswerKey = mutation({
  args:{legacyId:v.string(),examId:v.string(),version:v.number(),entries:v.array(answerEntry)},
  handler:async(ctx,args)=>{
    const user=await requirePermission(ctx,"academic.cbt.manage");
    const old=await ctx.db.query("answerKeys").withIndex("by_exam_status",q=>q.eq("examId",args.examId).eq("status","locked")).first();
    if(old) throw new Error("Locked answer key cannot be replaced");
    const now=Date.now();
    return await ctx.db.insert("answerKeys",{...args,status:"draft",createdBy:user.legacyId,createdAt:now,updatedAt:now});
  },
});

export const lockAnswerKey = mutation({
  args:{answerKeyId:v.string()},
  handler:async(ctx,args)=>{
    const user=await requirePermission(ctx,"academic.cbt.manage");
    const key=await ctx.db.query("answerKeys").withIndex("by_legacy_id",q=>q.eq("legacyId",args.answerKeyId)).unique();
    if(!key||key.createdBy!==user.legacyId) throw new Error("Forbidden");
    const now=Date.now();
    await ctx.db.patch(key._id,{status:"locked",lockedAt:now,updatedAt:now});
  },
});

export const register = mutation({
  args:{examId:v.string(),candidateName:v.string(),candidateIdentifier:v.optional(v.string()),candidateType:v.union(v.literal("cusat_student"),v.literal("external_candidate"),v.literal("guest_candidate")),accessCode:v.optional(v.string())},
  handler:async(ctx,args)=>{
    const user=await currentUser(ctx);
    const exam=await ctx.db.query("exams").withIndex("by_legacy_id",q=>q.eq("legacyId",args.examId)).unique();
    if(!exam) throw new Error("Exam not found");
    const now=Date.now();
    if(exam.registrationOpenAt && now<exam.registrationOpenAt) throw new Error("Registration is not open");
    if(exam.registrationCloseAt && now>exam.registrationCloseAt) throw new Error("Registration is closed");
    if(exam.accessType==="code" && args.accessCode!==exam.accessCode) throw new Error("Invalid access code");
    const existing=await ctx.db.query("examRegistrations").withIndex("by_exam_user",q=>q.eq("examId",args.examId).eq("userId",user.legacyId)).unique();
    if(existing) return existing._id;
    return await ctx.db.insert("examRegistrations",{legacyId:crypto.randomUUID(),examId:args.examId,userId:user.legacyId,candidateName:args.candidateName,candidateIdentifier:args.candidateIdentifier,candidateType:args.candidateType,status:"registered",createdAt:now,updatedAt:now});
  },
});

export const startAttempt = mutation({
  args:{examId:v.string(),accessCode:v.optional(v.string())},
  handler:async(ctx,args)=>{
    const user=await currentUser(ctx); const exam=await ctx.db.query("exams").withIndex("by_legacy_id",q=>q.eq("legacyId",args.examId)).unique();
    if(!exam) throw new Error("Exam not found");
    const now=Date.now();
    if(now<exam.startsAt || now>exam.endsAt) throw new Error("Exam is not live");
    if(exam.accessType==="code" && args.accessCode!==exam.accessCode) throw new Error("Invalid access code");
    const registration=await ctx.db.query("examRegistrations").withIndex("by_exam_user",q=>q.eq("examId",args.examId).eq("userId",user.legacyId)).unique();
    if(!registration) throw new Error("Registration required");
    const previous=await ctx.db.query("examAttempts").withIndex("by_exam_user",q=>q.eq("examId",args.examId).eq("userId",user.legacyId)).collect();
    const completed=previous.filter(a=>["submitted","expired"].includes(a.status)).length;
    if(completed>=exam.attemptsAllowed) throw new Error("Attempt limit reached");
    const active=previous.find(a=>a.status==="active");
    if(active) return active.legacyId;
    const key=await ctx.db.query("answerKeys").withIndex("by_exam_status",q=>q.eq("examId",args.examId).eq("status","locked")).order("desc").first();
    if(!key) throw new Error("Answer key is not locked");
    const expires=Math.min(now+exam.durationMinutes*60_000,exam.endsAt);
    return await ctx.db.insert("examAttempts",{legacyId:crypto.randomUUID(),examId:args.examId,registrationId:registration.legacyId,userId:user.legacyId,attemptNumber:completed+1,startedAt:now,expiresAt:expires,status:"active",answerKeyId:key.legacyId,correctCount:0,wrongCount:0,skippedCount:0,createdAt:now,updatedAt:now});
  },
});

export const getAttempt = query({
  args:{attemptId:v.string()},
  handler:async(ctx,args)=>{
    const user=await currentUser(ctx);
    const attempt=await ctx.db.query("examAttempts").withIndex("by_legacy_id",q=>q.eq("legacyId",args.attemptId)).unique();
    if(!attempt||attempt.userId!==user.legacyId) throw new Error("Forbidden");
    const links=await ctx.db.query("examQuestions").withIndex("by_exam_position",q=>q.eq("examId",attempt.examId)).order("asc").collect();
    const questions=[]; for(const link of links){const q=await ctx.db.query("questions").withIndex("by_legacy_id",x=>x.eq("legacyId",link.questionId)).unique();if(q)questions.push({...q,position:link.position});}
    const answers=await ctx.db.query("attemptAnswers").withIndex("by_attempt",q=>q.eq("attemptId",args.attemptId)).collect();
    return {attempt,questions,answers,serverTime:Date.now()};
  },
});

export const saveAnswer = mutation({
  args:{attemptId:v.string(),questionId:v.string(),selectedOption:v.optional(v.string()),isMarkedForReview:v.boolean()},
  handler:async(ctx,args)=>{
    const user=await currentUser(ctx); const attempt=await ctx.db.query("examAttempts").withIndex("by_legacy_id",q=>q.eq("legacyId",args.attemptId)).unique();
    if(!attempt||attempt.userId!==user.legacyId||attempt.status!=="active") throw new Error("Attempt unavailable");
    if(Date.now()>attempt.expiresAt) throw new Error("Attempt expired");
    const old=await ctx.db.query("attemptAnswers").withIndex("by_attempt_question",q=>q.eq("attemptId",args.attemptId).eq("questionId",args.questionId)).unique();
    const now=Date.now();
    if(old){await ctx.db.patch(old._id,{...args,answeredAt:now,updatedAt:now});return old._id;}
    return await ctx.db.insert("attemptAnswers",{...args,answeredAt:now,createdAt:now,updatedAt:now});
  },
});

export const submitAttempt = mutation({
  args:{attemptId:v.string()},
  handler:async(ctx,args)=>{
    const user=await currentUser(ctx); const attempt=await ctx.db.query("examAttempts").withIndex("by_legacy_id",q=>q.eq("legacyId",args.attemptId)).unique();
    if(!attempt||attempt.userId!==user.legacyId) throw new Error("Attempt not found");
    if(attempt.status!=="active") throw new Error("Attempt already submitted");
    const key=await ctx.db.query("answerKeys").withIndex("by_legacy_id",q=>q.eq("legacyId",attempt.answerKeyId)).unique();
    if(!key||key.status!=="locked") throw new Error("Answer key unavailable");
    const answers=await ctx.db.query("attemptAnswers").withIndex("by_attempt",q=>q.eq("attemptId",args.attemptId)).collect();
    let score=0,correct=0,wrong=0,skipped=0,totalMarks=0; for(const e of key.entries){totalMarks+=e.marks;const a=answers.find(x=>x.questionId===e.questionId);if(!a?.selectedOption){skipped++;continue;}if(e.correctOptions.includes(a.selectedOption)){correct++;score+=e.marks;}else{wrong++;score-=e.negativeMarks;}}
    score=Math.max(0,score); const now=Date.now(); const elapsed=Math.min(Math.max(0,Math.floor((now-attempt.startedAt)/1000)),Math.ceil((attempt.expiresAt-attempt.startedAt)/1000)); const status=now>attempt.expiresAt?"expired":"submitted";
    await ctx.db.patch(attempt._id,{status,submittedAt:now,score,correctCount:correct,wrongCount:wrong,skippedCount:skipped,timeTakenSeconds:elapsed,updatedAt:now});
    const old=await ctx.db.query("examResults").withIndex("by_legacy_id",q=>q.eq("legacyId",args.attemptId)).unique();
    const result={legacyId:args.attemptId,attemptId:args.attemptId,examId:attempt.examId,userId:user.legacyId,score,totalMarks,correctCount:correct,wrongCount:wrong,skippedCount:skipped,timeTakenSeconds:elapsed,updatedAt:now};
    if(old) await ctx.db.patch(old._id,result); else await ctx.db.insert("examResults",{...result,createdAt:now});
    return result;
  },
});

export const myResult = query({
  args:{examId:v.string()},
  handler:async(ctx,args)=>{const user=await currentUser(ctx);const r=await ctx.db.query("examResults").withIndex("by_user_exam",q=>q.eq("userId",user.legacyId).eq("examId",args.examId)).unique();if(!r||!r.releasedAt)return null;return r;}
});

export const releaseResults = mutation({
  args:{examId:v.string()},
  handler:async(ctx,args)=>{await requirePermission(ctx,"academic.cbt.results.release");const rows=await ctx.db.query("examResults").withIndex("by_exam_score",q=>q.eq("examId",args.examId)).collect();const now=Date.now();for(const r of rows)await ctx.db.patch(r._id,{releasedAt:now,updatedAt:now});return rows.length;}
});

export const results = query({
  args:{examId:v.string()},
  handler:async(ctx,args)=>{await requirePermission(ctx,"academic.cbt.results.export");return await ctx.db.query("examResults").withIndex("by_exam_score",q=>q.eq("examId",args.examId)).order("desc").collect();}
});
