import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { currentUser, requirePermission } from "./auth";

export const createRequest = mutation({
  args: { legacyId: v.string(), eventName: v.optional(v.string()), examDate: v.string(), startTime: v.optional(v.string()), location: v.optional(v.string()), requirements: v.optional(v.string()) },
  handler: async (ctx, args) => { const user = await currentUser(ctx); const now=Date.now(); return await ctx.db.insert("scribeRequests",{...args,requesterId:user.legacyId,status:"open",createdAt:now,updatedAt:now}); },
});
export const registerVolunteer = mutation({
  args: { languages: v.array(v.string()), availability: v.string(), experience: v.optional(v.string()) },
  handler: async (ctx,args)=>{const user=await currentUser(ctx);const now=Date.now();const old=await ctx.db.query("scribeVolunteers").withIndex("by_user",q=>q.eq("userId",user.legacyId)).unique();if(old){await ctx.db.patch(old._id,{...args,updatedAt:now});return old._id;}return await ctx.db.insert("scribeVolunteers",{...args,userId:user.legacyId,verificationStatus:"pending",createdAt:now,updatedAt:now});}
});
export const openRequests = query({args:{},handler:async ctx=>{await currentUser(ctx);return await ctx.db.query("scribeRequests").withIndex("by_status",q=>q.eq("status","open")).order("asc").collect();}});
export const assign = mutation({
  args:{requestId:v.string(),volunteerId:v.string()},
  handler:async(ctx,args)=>{const coordinator=await requirePermission(ctx,"sahayi.assignment.manage");const req=await ctx.db.query("scribeRequests").withIndex("by_legacy_id",q=>q.eq("legacyId",args.requestId)).unique();if(!req)throw new Error("Request not found");const now=Date.now();const id=await ctx.db.insert("scribeAssignments",{...args,coordinatorId:coordinator.legacyId,status:"offered",assignedAt:now,createdAt:now,updatedAt:now});await ctx.db.patch(req._id,{status:"assigned",updatedAt:now});return id;}
});
export const respondToAssignment = mutation({args:{assignmentId:v.id("scribeAssignments"),status:v.union(v.literal("accepted"),v.literal("declined"),v.literal("completed"))},handler:async(ctx,args)=>{const user=await currentUser(ctx);const a=await ctx.db.get(args.assignmentId);if(!a||a.volunteerId!==user.legacyId)throw new Error("Forbidden");await ctx.db.patch(a._id,{status:args.status,completedAt:args.status==="completed"?Date.now():a.completedAt,updatedAt:Date.now()});}});
