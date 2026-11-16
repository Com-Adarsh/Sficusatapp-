import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { env } from "./_generated/server";

const http = httpRouter();

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function authorize(request: Request) {
  const expected = env.CONVEX_API_SECRET;
  const supplied = request.headers.get("x-convex-api-secret");
  const actorUserId = request.headers.get("x-sfi-user-id");
  if (!expected || !supplied || supplied !== expected) {
    return { ok: false as const, response: json({ error: "Unauthorized" }, 401) };
  }
  if (!actorUserId) {
    return { ok: false as const, response: json({ error: "Missing x-sfi-user-id" }, 401) };
  }
  return { ok: true as const, actorUserId };
}

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => json({ ok: true, service: "sfi-cusat-convex", timestamp: new Date().toISOString() })),
});

http.route({
  path: "/api/academic/exams",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const departmentId = new URL(request.url).searchParams.get("departmentId") ?? undefined;
    const exams = await ctx.runQuery(internal.cbt.listPublishedExams, { departmentId });
    return json({ exams });
  }),
});

http.route({
  path: "/api/cbt/exams",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const body = await request.json();
    const examId = String(body.id ?? crypto.randomUUID());
    const id = await ctx.runMutation(internal.cbt.upsertExam, {
      legacyId: examId,
      departmentId: body.departmentId ? String(body.departmentId) : undefined,
      coordinatorId: auth.actorUserId,
      title: String(body.title),
      description: body.description ? String(body.description) : undefined,
      instructions: body.instructions ? String(body.instructions) : undefined,
      registrationOpenAt: body.registrationOpenAt ? Date.parse(body.registrationOpenAt) : undefined,
      registrationCloseAt: body.registrationCloseAt ? Date.parse(body.registrationCloseAt) : undefined,
      startsAt: Date.parse(body.startsAt),
      endsAt: Date.parse(body.endsAt),
      durationMinutes: Number(body.durationMinutes),
      attemptsAllowed: Number(body.attemptsAllowed ?? 1),
      negativeMarkingEnabled: Boolean(body.negativeMarkingEnabled),
      negativeMarkingValue: Number(body.negativeMarkingValue ?? 0),
      accessType: String(body.accessType ?? "public"),
      accessCode: body.accessCode ? String(body.accessCode) : undefined,
      status: String(body.status ?? "draft"),
    });
    return json({ examId: id }, 201);
  }),
});

http.route({
  pathPrefix: "/api/cbt/exams/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const path = new URL(request.url).pathname;
    const id = path.split("/").filter(Boolean).pop();
    if (!id) return json({ error: "Exam id required" }, 400);
    const exam = await ctx.runQuery(internal.cbt.getExam, { legacyId: id });
    if (!exam) return json({ error: "Exam not found" }, 404);
    return json({ exam });
  }),
});

http.route({
  path: "/api/cbt/register",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const body = await request.json();
    const id = await ctx.runMutation(internal.cbt.registerStudent, {
      legacyId: String(body.registrationId ?? crypto.randomUUID()),
      examId: String(body.examId),
      userId: auth.actorUserId,
      candidateName: String(body.candidateName ?? auth.actorUserId),
      candidateIdentifier: body.candidateIdentifier ? String(body.candidateIdentifier) : undefined,
    });
    return json({ registrationId: id }, 201);
  }),
});

http.route({
  path: "/api/cbt/attempts/start",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const body = await request.json();
    const id = await ctx.runMutation(internal.cbt.startAttempt, {
      legacyId: String(body.attemptId ?? crypto.randomUUID()),
      examId: String(body.examId),
      registrationId: String(body.registrationId),
      userId: auth.actorUserId,
      attemptNumber: Number(body.attemptNumber ?? 1),
    });
    return json({ attemptId: id }, 201);
  }),
});

http.route({
  path: "/api/cbt/attempts/questions",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const attemptId = new URL(request.url).searchParams.get("attemptId");
    if (!attemptId) return json({ error: "attemptId required" }, 400);
    const attempt = await ctx.runQuery(internal.cbt.getAttempt, { attemptId, userId: auth.actorUserId });
    if (!attempt) return json({ error: "Attempt not found" }, 404);
    return json(attempt);
  }),
});

http.route({
  path: "/api/cbt/attempts/answer",
  method: "PUT",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const body = await request.json();
    const id = await ctx.runMutation(internal.cbt.saveAnswer, {
      attemptId: String(body.attemptId),
      questionId: String(body.questionId),
      selectedOption: body.selectedOption === null || body.selectedOption === undefined ? undefined : String(body.selectedOption),
      isMarkedForReview: Boolean(body.markedForReview),
    });
    return json({ answerId: id });
  }),
});

http.route({
  path: "/api/cbt/attempts/submit",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const body = await request.json();
    const result = await ctx.runMutation(internal.cbt.submitAttempt, {
      attemptId: String(body.attemptId),
      userId: auth.actorUserId,
    });
    return json({ submitted: true, result });
  }),
});

http.route({
  path: "/api/cbt/results",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const examId = new URL(request.url).searchParams.get("examId");
    if (!examId) return json({ error: "examId required" }, 400);
    const results = await ctx.runQuery(internal.cbt.listResults, { examId });
    return json({ results });
  }),
});

http.route({
  path: "/api/cbt/results/release",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = authorize(request);
    if (!auth.ok) return auth.response;
    const body = await request.json();
    const count = await ctx.runMutation(internal.cbt.releaseResults, { examId: String(body.examId) });
    return json({ released: true, count });
  }),
});

export default http;
