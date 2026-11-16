import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

const now = () => Date.now();

export const upsertUser = internalMutation({
  args: {
    legacyId: v.string(),
    email: v.string(),
    fullName: v.string(),
    role: v.string(),
    status: v.string(),
    rollNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").withIndex("by_legacy_id", q => q.eq("legacyId", args.legacyId)).unique();
    const timestamp = now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: timestamp });
      return existing._id;
    }
    return await ctx.db.insert("users", { ...args, createdAt: timestamp, updatedAt: timestamp });
  },
});

export const upsertDepartment = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("departments").withIndex("by_legacy_id", q => q.eq("legacyId", args.legacyId)).unique();
    const timestamp = now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: timestamp });
      return existing._id;
    }
    return await ctx.db.insert("departments", { ...args, createdAt: timestamp, updatedAt: timestamp });
  },
});

export const createHelpdeskTicket = internalMutation({
  args: {
    legacyId: v.string(),
    createdBy: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    return await ctx.db.insert("helpdeskTickets", {
      ...args,
      status: "open",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const createBloodRequest = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    return await ctx.db.insert("bloodRequests", {
      ...args,
      status: "open",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const createScribeRequest = internalMutation({
  args: {
    legacyId: v.string(),
    requesterId: v.string(),
    eventName: v.optional(v.string()),
    examDate: v.string(),
    startTime: v.optional(v.string()),
    location: v.optional(v.string()),
    requirements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    return await ctx.db.insert("scribeRequests", {
      ...args,
      status: "open",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const createEvent = internalMutation({
  args: {
    legacyId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    venue: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = now();
    return await ctx.db.insert("events", {
      ...args,
      status: "draft",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const listApprovedOpportunities = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("opportunities").withIndex("by_status_deadline", q => q.eq("status", "approved")).collect();
  },
});

export const appendAuditLog = internalMutation({
  args: {
    actorUserId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    beforeData: v.optional(v.string()),
    afterData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", { ...args, createdAt: now() });
  },
});

export const upsertNotification = internalMutation({
  args: {
    legacyId: v.string(),
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("notifications").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
    const match = existing.find(n => n.legacyId === args.legacyId);
    const timestamp = now();
    if (match) {
      await ctx.db.patch(match._id, { ...args, updatedAt: timestamp });
      return match._id;
    }
    return await ctx.db.insert("notifications", { ...args, createdAt: timestamp, updatedAt: timestamp });
  },
});
