import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const timestamps = {
  createdAt: v.number(),
  updatedAt: v.number(),
};

export default defineSchema({
  // Identity is intentionally kept outside Convex Auth for this migration layer.
  // Fastify remains the authentication gateway and passes actorUserId to the
  // protected HTTP bridge. This lets us migrate data without breaking current login.
  users: defineTable({
    legacyId: v.string(),
    email: v.string(),
    fullName: v.string(),
    role: v.string(),
    status: v.string(),
    rollNumber: v.optional(v.string()),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_email", ["email"]).index("by_roll_number", ["rollNumber"]),

  departments: defineTable({
    legacyId: v.string(),
    name: v.string(),
    shortName: v.optional(v.string()),
    description: v.optional(v.string()),
    officialEmail: v.optional(v.string()),
    website: v.optional(v.string()),
    building: v.optional(v.string()),
    room: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.string(),
    createdBy: v.optional(v.string()),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_status", ["status"]),

  exams: defineTable({
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
    publishedAt: v.optional(v.number()),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_coordinator", ["coordinatorId"]).index("by_status", ["status"]).index("by_department", ["departmentId"]),

  questions: defineTable({
    legacyId: v.string(),
    questionBankId: v.string(),
    questionType: v.string(),
    questionText: v.string(),
    marks: v.number(),
    negativeMarks: v.number(),
    difficulty: v.optional(v.string()),
    position: v.number(),
    options: v.array(v.object({ key: v.string(), text: v.string(), position: v.number() })),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_bank", ["questionBankId"]),

  questionBanks: defineTable({
    legacyId: v.string(),
    ownerUserId: v.string(),
    departmentId: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    sourceType: v.string(),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_owner", ["ownerUserId"]),

  examQuestions: defineTable({
    examId: v.string(),
    questionId: v.string(),
    position: v.number(),
  }).index("by_exam", ["examId"]).index("by_exam_position", ["examId", "position"]),

  answerKeys: defineTable({
    legacyId: v.string(),
    examId: v.string(),
    version: v.number(),
    status: v.string(),
    createdBy: v.string(),
    lockedAt: v.optional(v.number()),
    entries: v.array(v.object({
      questionId: v.string(),
      correctOptions: v.array(v.string()),
      marks: v.number(),
      negativeMarks: v.number(),
    })),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_exam_version", ["examId", "version"]).index("by_exam_status", ["examId", "status"]),

  examRegistrations: defineTable({
    legacyId: v.string(),
    examId: v.string(),
    userId: v.string(),
    candidateName: v.string(),
    candidateIdentifier: v.optional(v.string()),
    status: v.string(),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_exam_user", ["examId", "userId"]).index("by_user", ["userId"]),

  examAttempts: defineTable({
    legacyId: v.string(),
    examId: v.string(),
    registrationId: stringValidator(),
    userId: v.string(),
    attemptNumber: v.number(),
    startedAt: v.number(),
    expiresAt: v.number(),
    submittedAt: v.optional(v.number()),
    status: v.string(),
    answerKeyId: v.string(),
    score: v.optional(v.number()),
    correctCount: v.number(),
    wrongCount: v.number(),
    skippedCount: v.number(),
    timeTakenSeconds: v.optional(v.number()),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_exam_user", ["examId", "userId"]).index("by_user", ["userId"]).index("by_status", ["status"]),

  attemptAnswers: defineTable({
    attemptId: v.string(),
    questionId: v.string(),
    selectedOption: v.optional(v.string()),
    isMarkedForReview: v.boolean(),
    answeredAt: v.number(),
    ...timestamps,
  }).index("by_attempt_question", ["attemptId", "questionId"]).index("by_attempt", ["attemptId"]),

  examResults: defineTable({
    legacyId: v.string(),
    attemptId: v.string(),
    examId: v.string(),
    userId: v.string(),
    score: v.number(),
    totalMarks: v.number(),
    correctCount: v.number(),
    wrongCount: v.number(),
    skippedCount: v.number(),
    timeTakenSeconds: v.number(),
    releasedAt: v.optional(v.number()),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_exam_score", ["examId", "score"]).index("by_user_exam", ["userId", "examId"]),

  helpdeskTickets: defineTable({
    legacyId: v.string(),
    createdBy: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    priority: v.string(),
    status: v.string(),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_creator", ["createdBy"]).index("by_status", ["status"]),

  bloodRequests: defineTable({
    legacyId: v.string(),
    createdBy: v.string(),
    patientName: v.string(),
    bloodGroup: v.string(),
    hospital: v.string(),
    location: v.optional(v.string()),
    urgency: v.string(),
    unitsRequired: v.number(),
    neededAt: v.optional(v.number()),
    contactMethod: v.optional(v.string()),
    status: v.string(),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_status", ["status"]).index("by_blood_group", ["bloodGroup"]),

  scribeRequests: defineTable({
    legacyId: v.string(),
    requesterId: v.string(),
    eventName: v.optional(v.string()),
    examDate: v.string(),
    startTime: v.optional(v.string()),
    location: v.optional(v.string()),
    requirements: v.optional(v.string()),
    status: v.string(),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_requester", ["requesterId"]).index("by_status", ["status"]),

  events: defineTable({
    legacyId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    venue: v.optional(v.string()),
    createdBy: v.string(),
    status: v.string(),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_creator", ["createdBy"]),

  opportunities: defineTable({
    legacyId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    organization: v.optional(v.string()),
    deadline: v.optional(v.number()),
    status: v.string(),
    url: v.optional(v.string()),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_status_deadline", ["status", "deadline"]),

  notifications: defineTable({
    legacyId: v.string(),
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    type: v.string(),
    readAt: v.optional(v.number()),
    ...timestamps,
  }).index("by_user", ["userId"]).index("by_user_created", ["userId", "createdAt"]),

  auditLogs: defineTable({
    actorUserId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    beforeData: v.optional(v.string()),
    afterData: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_actor_created", ["actorUserId", "createdAt"]).index("by_entity", ["entityType", "entityId"]),
});

function stringValidator() {
  return v.string();
}
