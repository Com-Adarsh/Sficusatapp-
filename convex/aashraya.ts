import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { currentUser, requirePermission } from "./auth";

export const registerDonor = mutation({
  args: { bloodGroup: v.string(), district: v.optional(v.string()), availabilityStatus: v.string(), consentStatus: v.string(), lastDonationDate: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx); const now = Date.now();
    const existing = await ctx.db.query("bloodDonors").withIndex("by_user", q => q.eq("userId", user.legacyId)).unique();
    if (existing) { await ctx.db.patch(existing._id, { ...args, updatedAt: now }); return existing._id; }
    return await ctx.db.insert("bloodDonors", { ...args, userId: user.legacyId, verified: false, createdAt: now, updatedAt: now });
  },
});

export const createRequest = mutation({
  args: { legacyId: v.string(), patientName: v.string(), bloodGroup: v.string(), hospital: v.string(), location: v.optional(v.string()), urgency: v.string(), unitsRequired: v.number(), neededAt: v.optional(v.number()), contactMethod: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx); const now = Date.now();
    return await ctx.db.insert("bloodRequests", { ...args, createdBy: user.legacyId, status: "open", createdAt: now, updatedAt: now });
  },
});

export const openRequests = query({
  args: { bloodGroup: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const rows = args.bloodGroup
      ? await ctx.db.query("bloodRequests").withIndex("by_blood_group", q => q.eq("bloodGroup", args.bloodGroup!)).collect()
      : await ctx.db.query("bloodRequests").withIndex("by_status", q => q.eq("status", "open")).collect();
    return rows.filter(r => r.status === "open").map(r => ({ id: r.legacyId, bloodGroup: r.bloodGroup, hospital: r.hospital, location: r.location, urgency: r.urgency, unitsRequired: r.unitsRequired, neededAt: r.neededAt, status: r.status }));
  },
});

export const respond = mutation({
  args: { requestId: v.string(), response: v.union(v.literal("interested"), v.literal("declined"), v.literal("confirmed")) },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx); const now = Date.now();
    const existing = await ctx.db.query("donorResponses").withIndex("by_request", q => q.eq("requestId", args.requestId)).collect();
    const mine = existing.find(x => x.donorUserId === user.legacyId);
    if (mine) { await ctx.db.patch(mine._id, { response: args.response, updatedAt: now }); return mine._id; }
    return await ctx.db.insert("donorResponses", { requestId: args.requestId, donorUserId: user.legacyId, response: args.response, createdAt: now, updatedAt: now });
  },
});

export const matchDonor = mutation({
  args: { requestId: v.string(), donorUserId: v.string() },
  handler: async (ctx, args) => {
    const coordinator = await requirePermission(ctx, "aashraya.request.manage"); const now = Date.now();
    return await ctx.db.insert("bloodMatches", { ...args, coordinatorId: coordinator.legacyId, status: "confirmed", createdAt: now, updatedAt: now });
  },
});
