import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const timestamps = { createdAt: v.number(), updatedAt: v.number() };
const status = v.string();

export default defineSchema({
  users: defineTable({
    legacyId: v.string(), email: v.string(), fullName: v.string(), status,
    rollNumber: v.optional(v.string()), normalizedRollNumber: v.optional(v.string()),
    avatarUrl: v.optional(v.string()), phone: v.optional(v.string()),
    ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_email", ["email"])
    .index("by_roll_number", ["normalizedRollNumber"]),

  studentProfiles: defineTable({
    userId: v.string(), studentId: v.optional(v.string()), rollNumber: v.optional(v.string()),
    departmentId: v.optional(v.string()), programme: v.optional(v.string()),
    semester: v.optional(v.number()), year: v.optional(v.number()),
    campus: v.optional(v.string()), admissionYear: v.optional(v.number()),
    graduationYear: v.optional(v.number()), verificationStatus: status, ...timestamps,
  }).index("by_user", ["userId"]).index("by_department", ["departmentId"])
    .index("by_roll_number", ["rollNumber"]),

  roles: defineTable({ key: v.string(), name: v.string(), description: v.optional(v.string()), ...timestamps })
    .index("by_key", ["key"]),
  permissions: defineTable({ key: v.string(), description: v.optional(v.string()), ...timestamps })
    .index("by_key", ["key"]),
  rolePermissions: defineTable({ roleKey: v.string(), permissionKey: v.string(), ...timestamps })
    .index("by_role", ["roleKey"]).index("by_permission", ["permissionKey"]),
  userRoles: defineTable({
    userId: v.string(), roleKey: v.string(), scopeType: v.optional(v.string()),
    scopeId: v.optional(v.string()), ...timestamps,
  }).index("by_user", ["userId"]).index("by_user_role", ["userId", "roleKey"]),

  departments: defineTable({
    legacyId: v.string(), name: v.string(), shortName: v.optional(v.string()),
    description: v.optional(v.string()), officialEmail: v.optional(v.string()),
    website: v.optional(v.string()), building: v.optional(v.string()), room: v.optional(v.string()),
    phone: v.optional(v.string()), status, createdBy: v.optional(v.string()), verifiedAt: v.optional(v.number()), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_status", ["status"]),

  departmentCoordinators: defineTable({
    departmentId: v.string(), userId: v.string(), designation: v.optional(v.string()),
    officialEmail: v.optional(v.string()), verified: v.boolean(), ...timestamps,
  }).index("by_department", ["departmentId"]).index("by_user", ["userId"]),

  resources: defineTable({
    legacyId: v.string(), title: v.string(), description: v.optional(v.string()),
    departmentId: v.optional(v.string()), programme: v.optional(v.string()), semester: v.optional(v.number()),
    subject: v.optional(v.string()), category: v.string(), status, createdBy: v.string(),
    verifiedBy: v.optional(v.string()), publishedAt: v.optional(v.number()), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_status", ["status"])
    .index("by_department", ["departmentId"]).index("by_subject", ["subject"]),

  files: defineTable({
    ownerUserId: v.string(), storageId: v.string(), name: v.string(), mimeType: v.string(),
    size: v.number(), checksum: v.optional(v.string()), visibility: status, ...timestamps,
  }).index("by_owner", ["ownerUserId"]).index("by_storage", ["storageId"]),

  questionBanks: defineTable({
    legacyId: v.string(), ownerUserId: v.string(), departmentId: v.optional(v.string()),
    title: v.string(), description: v.optional(v.string()), sourceType: v.string(), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_owner", ["ownerUserId"]),

  questions: defineTable({
    legacyId: v.string(), questionBankId: v.string(), questionType: v.string(),
    questionText: v.string(), marks: v.number(), negativeMarks: v.number(),
    difficulty: v.optional(v.string()), position: v.number(),
    options: v.array(v.object({ key: v.string(), text: v.string(), position: v.number() })), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_bank", ["questionBankId"]),

  exams: defineTable({
    legacyId: v.string(), departmentId: v.optional(v.string()), coordinatorId: v.string(),
    title: v.string(), description: v.optional(v.string()), instructions: v.optional(v.string()),
    registrationOpenAt: v.optional(v.number()), registrationCloseAt: v.optional(v.number()),
    startsAt: v.number(), endsAt: v.number(), durationMinutes: v.number(), attemptsAllowed: v.number(),
    negativeMarkingEnabled: v.boolean(), negativeMarkingValue: v.number(), accessType: v.string(),
    accessCode: v.optional(v.string()), status, publishedAt: v.optional(v.number()), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_coordinator", ["coordinatorId"])
    .index("by_status", ["status"]).index("by_department", ["departmentId"]),

  examQuestions: defineTable({ examId: v.string(), questionId: v.string(), position: v.number(), ...timestamps })
    .index("by_exam", ["examId"]).index("by_exam_position", ["examId", "position"]),
  answerKeys: defineTable({
    legacyId: v.string(), examId: v.string(), version: v.number(), status,
    createdBy: v.string(), lockedAt: v.optional(v.number()),
    entries: v.array(v.object({ questionId: v.string(), correctOptions: v.array(v.string()),
      marks: v.number(), negativeMarks: v.number() })), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_exam_version", ["examId", "version"])
    .index("by_exam_status", ["examId", "status"]),
  examRegistrations: defineTable({
    legacyId: v.string(), examId: v.string(), userId: v.string(), candidateName: v.string(),
    candidateIdentifier: v.optional(v.string()), candidateType: v.string(), status, ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_exam_user", ["examId", "userId"])
    .index("by_user", ["userId"]),
  examAttempts: defineTable({
    legacyId: v.string(), examId: v.string(), registrationId: v.string(), userId: v.string(),
    attemptNumber: v.number(), startedAt: v.number(), expiresAt: v.number(), submittedAt: v.optional(v.number()),
    status, answerKeyId: v.string(), score: v.optional(v.number()), correctCount: v.number(),
    wrongCount: v.number(), skippedCount: v.number(), timeTakenSeconds: v.optional(v.number()), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_exam_user", ["examId", "userId"])
    .index("by_user", ["userId"]).index("by_status", ["status"]),
  attemptAnswers: defineTable({
    attemptId: v.string(), questionId: v.string(), selectedOption: v.optional(v.string()),
    isMarkedForReview: v.boolean(), answeredAt: v.number(), ...timestamps,
  }).index("by_attempt_question", ["attemptId", "questionId"]).index("by_attempt", ["attemptId"]),
  examResults: defineTable({
    legacyId: v.string(), attemptId: v.string(), examId: v.string(), userId: v.string(),
    score: v.number(), totalMarks: v.number(), correctCount: v.number(), wrongCount: v.number(),
    skippedCount: v.number(), timeTakenSeconds: v.number(), releasedAt: v.optional(v.number()), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_exam_score", ["examId", "score"])
    .index("by_user_exam", ["userId", "examId"]),

  helpdeskTickets: defineTable({
    legacyId: v.string(), createdBy: v.string(), category: v.string(), subcategory: v.optional(v.string()),
    title: v.string(), description: v.string(), priority: v.string(), status,
    assignedTo: v.optional(v.string()), departmentId: v.optional(v.string()), resolvedAt: v.optional(v.number()), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_creator", ["createdBy"])
    .index("by_status", ["status"]).index("by_assignee", ["assignedTo"]),
  ticketMessages: defineTable({
    ticketId: v.string(), senderId: v.string(), message: v.string(), attachmentFileId: v.optional(v.string()), ...timestamps,
  }).index("by_ticket", ["ticketId"]),
  issueEscalations: defineTable({
    ticketId: v.string(), fromUserId: v.string(), toUserId: v.optional(v.string()),
    reason: v.string(), status, ...timestamps,
  }).index("by_ticket", ["ticketId"]),
  issueActions: defineTable({
    ticketId: v.string(), actorUserId: v.string(), action: v.string(), note: v.optional(v.string()), ...timestamps,
  }).index("by_ticket", ["ticketId"]),

  bloodDonors: defineTable({
    userId: v.string(), bloodGroup: v.string(), district: v.optional(v.string()),
    availabilityStatus: status, lastDonationDate: v.optional(v.number()), consentStatus: status,
    verified: v.boolean(), ...timestamps,
  }).index("by_user", ["userId"]).index("by_blood_group", ["bloodGroup"])
    .index("by_status", ["availabilityStatus"]),
  bloodRequests: defineTable({
    legacyId: v.string(), createdBy: v.string(), patientName: v.string(), bloodGroup: v.string(),
    hospital: v.string(), location: v.optional(v.string()), urgency: v.string(), unitsRequired: v.number(),
    neededAt: v.optional(v.number()), contactMethod: v.optional(v.string()), status, ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_status", ["status"]).index("by_blood_group", ["bloodGroup"]),
  donorResponses: defineTable({
    requestId: v.string(), donorUserId: v.string(), response: status, ...timestamps,
  }).index("by_request", ["requestId"]).index("by_donor", ["donorUserId"]),
  bloodMatches: defineTable({
    requestId: v.string(), donorUserId: v.string(), coordinatorId: v.optional(v.string()), status, ...timestamps,
  }).index("by_request", ["requestId"]).index("by_donor", ["donorUserId"]),

  scribeRequests: defineTable({
    legacyId: v.string(), requesterId: v.string(), eventName: v.optional(v.string()),
    examDate: v.string(), startTime: v.optional(v.string()), location: v.optional(v.string()),
    requirements: v.optional(v.string()), status, ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_requester", ["requesterId"]).index("by_status", ["status"]),
  scribeVolunteers: defineTable({
    userId: v.string(), languages: v.array(v.string()), availability: v.string(),
    experience: v.optional(v.string()), verificationStatus: status, ...timestamps,
  }).index("by_user", ["userId"]).index("by_status", ["verificationStatus"]),
  scribeAssignments: defineTable({
    requestId: v.string(), volunteerId: v.string(), coordinatorId: v.optional(v.string()),
    status, assignedAt: v.number(), completedAt: v.optional(v.number()), ...timestamps,
  }).index("by_request", ["requestId"]).index("by_volunteer", ["volunteerId"]),

  events: defineTable({
    legacyId: v.string(), title: v.string(), description: v.optional(v.string()), category: v.optional(v.string()),
    startsAt: v.optional(v.number()), endsAt: v.optional(v.number()), venue: v.optional(v.string()),
    createdBy: v.string(), status, publishedAt: v.optional(v.number()), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_creator", ["createdBy"]).index("by_status", ["status"]),
  eventRegistrations: defineTable({
    eventId: v.string(), userId: v.string(), status, registeredAt: v.number(), ...timestamps,
  }).index("by_event", ["eventId"]).index("by_user", ["userId"]),
  competitions: defineTable({
    eventId: v.string(), title: v.string(), description: v.optional(v.string()), status, ...timestamps,
  }).index("by_event", ["eventId"]),
  competitionEntries: defineTable({
    competitionId: v.string(), userId: v.string(), submissionFileId: v.optional(v.string()),
    score: v.optional(v.number()), status, ...timestamps,
  }).index("by_competition", ["competitionId"]).index("by_user", ["userId"]),
  competitionJudges: defineTable({ competitionId: v.string(), userId: v.string(), ...timestamps })
    .index("by_competition", ["competitionId"]),
  competitionScores: defineTable({
    entryId: v.string(), judgeId: v.string(), score: v.number(), note: v.optional(v.string()), ...timestamps,
  }).index("by_entry", ["entryId"]),

  opportunities: defineTable({
    legacyId: v.string(), title: v.string(), description: v.optional(v.string()), organization: v.optional(v.string()),
    category: v.string(), eligibility: v.optional(v.string()), location: v.optional(v.string()),
    mode: v.optional(v.string()), deadline: v.optional(v.number()), applicationUrl: v.optional(v.string()),
    sourceUrl: v.optional(v.string()), status, createdBy: v.string(), verifiedBy: v.optional(v.string()),
    publishedAt: v.optional(v.number()), ...timestamps,
  }).index("by_legacy_id", ["legacyId"]).index("by_status_deadline", ["status", "deadline"])
    .index("by_category", ["category"]),

  notifications: defineTable({
    legacyId: v.string(), userId: v.string(), title: v.string(), body: v.string(), type: v.string(),
    link: v.optional(v.string()), readAt: v.optional(v.number()), ...timestamps,
  }).index("by_user", ["userId"]).index("by_user_created", ["userId", "createdAt"]),
  notificationPreferences: defineTable({
    userId: v.string(), channel: v.string(), enabled: v.boolean(), type: v.optional(v.string()), ...timestamps,
  }).index("by_user", ["userId"]),

  auditLogs: defineTable({
    actorUserId: v.string(), action: v.string(), entityType: v.string(), entityId: v.optional(v.string()),
    beforeData: v.optional(v.string()), afterData: v.optional(v.string()), createdAt: v.number(),
  }).index("by_actor_created", ["actorUserId", "createdAt"]).index("by_entity", ["entityType", "entityId"]),
});
