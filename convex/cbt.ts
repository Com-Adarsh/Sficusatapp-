import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

const now = () => Date.now();

const examArgs = {
  legacyId: v.string(),
  departmentId: v.optional(v.string()),
  coordinatorId: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  instructions: v.optional(v.string()),
  registrationOpenAt: v.optional(v.number()),
  registrationCloseAt: v.optional(v.number()),
  startsAt: v.number(),
  endsAt: v.number(),
  durationMinutes: v.number(),
  attemptsAllowed: v.number(),
  negativeMarkingEnabled: v.boolean(),
  negativeMarkingValue: v.number(),
  accessType: v.string(),
  accessCode: v.optional(v.string()),
  status: v.string(),
};

export const upsertExam = internalMutation({
  args: examArgs,
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("exams").withIndex("by_legacy_id", q => q.eq("legacyId", args.legacyId)).unique();
    const timestamp = now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: timestamp });
      return existing._id;
    }
    return await ctx.db.insert("exams", { ...args, createdAt: timestamp, updatedAt: timestamp });
  },
});

export const listPublishedExams = internalQuery({
  args: { departmentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const exams = args.departmentId
      ? await ctx.db.query("exams").withIndex("by_department", q => q.eq("departmentId", args.departmentId)).collect()
      : await ctx.db.query("exams").withIndex("by_status", q => q.eq("status", "scheduled")).collect();
    return exams
      .filter(e => ["scheduled", "registration_open", "live", "closed", "results_ready"].includes(e.status))
      .sort((a, b) => a.startsAt - b.startsAt);
  },
});

export const registerStudent = internalMutation({
  args: {
    legacyId: v.string(),
    examId: v.string(),
    userId: v.string(),
    candidateName: v.string(),
    candidateIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const exam = await ctx.db.query("exams").withIndex("by_legacy_id", q => q.eq("legacyId", args.examId)).unique();
    if (!exam) throw new Error("Exam not found");
    const existing = await ctx.db.query("examRegistrations").withIndex("by_exam_user", q => q.eq("examId", args.examId).eq("userId", args.userId)).first();
    if (existing) return existing._id;
    const timestamp = now();
    return await ctx.db.insert("examRegistrations", {
      ...args,
      status: "registered",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const startAttempt = internalMutation({
  args: {
    legacyId: v.string(),
    examId: v.string(),
    registrationId: v.string(),
    userId: v.string(),
    attemptNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const exam = await ctx.db.query("exams").withIndex("by_legacy_id", q => q.eq("legacyId", args.examId)).unique();
    if (!exam) throw new Error("Exam not found");
    const key = await ctx.db.query("answerKeys").withIndex("by_exam_status", q => q.eq("examId", args.examId).eq("status", "locked")).order("desc").first();
    if (!key) throw new Error("Answer key is not ready");
    const start = now();
    const expires = Math.min(start + exam.durationMinutes * 60_000, exam.endsAt);
    const timestamp = now();
    return await ctx.db.insert("examAttempts", {
      ...args,
      startedAt: start,
      expiresAt: expires,
      answerKeyId: key.legacyId,
      status: "active",
      correctCount: 0,
      wrongCount: 0,
      skippedCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const saveAnswer = internalMutation({
  args: {
    attemptId: v.string(),
    questionId: v.string(),
    selectedOption: v.optional(v.string()),
    isMarkedForReview: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("attemptAnswers").withIndex("by_attempt_question", q => q.eq("attemptId", args.attemptId).eq("questionId", args.questionId)).unique();
    const timestamp = now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, answeredAt: timestamp, updatedAt: timestamp });
      return existing._id;
    }
    return await ctx.db.insert("attemptAnswers", { ...args, answeredAt: timestamp, createdAt: timestamp, updatedAt: timestamp });
  },
});

export const getAttempt = internalQuery({
  args: { attemptId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.query("examAttempts").withIndex("by_legacy_id", q => q.eq("legacyId", args.attemptId)).unique();
    if (!attempt || attempt.userId !== args.userId) return null;
    const answers = await ctx.db.query("attemptAnswers").withIndex("by_attempt", q => q.eq("attemptId", args.attemptId)).collect();
    const questions = await ctx.db.query("examQuestions").withIndex("by_exam_position", q => q.eq("examId", attempt.examId)).order("asc").collect();
    const questionDocs = [];
    for (const link of questions) {
      const question = await ctx.db.query("questions").withIndex("by_legacy_id", q => q.eq("legacyId", link.questionId)).unique();
      if (question) questionDocs.push({ ...question, position: link.position });
    }
    return { attempt, answers, questions: questionDocs };
  },
});

export const submitAttempt = internalMutation({
  args: { attemptId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const attempt = await ctx.db.query("examAttempts").withIndex("by_legacy_id", q => q.eq("legacyId", args.attemptId)).unique();
    if (!attempt || attempt.userId !== args.userId) throw new Error("Attempt not found");
    if (attempt.status !== "active") throw new Error("Attempt already submitted");

    const exam = await ctx.db.query("exams").withIndex("by_legacy_id", q => q.eq("legacyId", attempt.examId)).unique();
    const key = await ctx.db.query("answerKeys").withIndex("by_legacy_id", q => q.eq("legacyId", attempt.answerKeyId)).unique();
    if (!exam || !key) throw new Error("Exam configuration is incomplete");

    const answers = await ctx.db.query("attemptAnswers").withIndex("by_attempt", q => q.eq("attemptId", args.attemptId)).collect();
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let totalMarks = 0;

    for (const entry of key.entries) {
      totalMarks += entry.marks;
      const answer = answers.find(a => a.questionId === entry.questionId);
      if (!answer?.selectedOption) {
        skipped++;
        continue;
      }
      if (entry.correctOptions.includes(answer.selectedOption)) {
        correct++;
        score += entry.marks;
      } else {
        wrong++;
        score -= entry.negativeMarks;
      }
    }

    score = Math.max(0, score);
    const submittedAt = now();
    const elapsed = Math.min(
      Math.max(0, Math.floor((submittedAt - attempt.startedAt) / 1000)),
      Math.ceil((attempt.expiresAt - attempt.startedAt) / 1000),
    );
    const status = submittedAt > attempt.expiresAt ? "expired" : "submitted";

    await ctx.db.patch(attempt._id, {
      status,
      submittedAt,
      score,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      timeTakenSeconds: elapsed,
      updatedAt: submittedAt,
    });

    const existing = await ctx.db.query("examResults").withIndex("by_legacy_id", q => q.eq("legacyId", args.attemptId)).unique();
    const result = {
      legacyId: args.attemptId,
      attemptId: args.attemptId,
      examId: attempt.examId,
      userId: args.userId,
      score,
      totalMarks,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      timeTakenSeconds: elapsed,
      updatedAt: submittedAt,
    };
    if (existing) await ctx.db.patch(existing._id, result);
    else await ctx.db.insert("examResults", { ...result, createdAt: submittedAt });
    return result;
  },
});

export const listResults = internalQuery({
  args: { examId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("examResults").withIndex("by_exam_score", q => q.eq("examId", args.examId)).order("desc").collect();
  },
});

export const releaseResults = internalMutation({
  args: { examId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db.query("examResults").withIndex("by_exam_score", q => q.eq("examId", args.examId)).collect();
    const timestamp = now();
    for (const result of results) await ctx.db.patch(result._id, { releasedAt: timestamp, updatedAt: timestamp });
    return results.length;
  },
});
