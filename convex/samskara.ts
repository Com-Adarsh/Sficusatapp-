import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { currentUser, requirePermission } from "./auth";

export const createEvent = mutation({
  args:{legacyId:v.string(),title:v.string(),description:v.optional(v.string()),category:v.optional(v.string()),startsAt:v.optional(v.number()),endsAt:v.optional(v.number()),venue:v.optional(v.string())},
  handler:async(ctx,args)=>{const user=await requirePermission(ctx,"samskara.event.create");const now=Date.now();return await ctx.db.insert("events",{...args,createdBy:user.legacyId,status:"draft",createdAt:now,updatedAt:now});}
});
export const publishEvent = mutation({args:{eventId:v.string()},handler:async(ctx,args)=>{await requirePermission(ctx,"samskara.event.manage");const e=await ctx.db.query("events").withIndex("by_legacy_id",q=>q.eq("legacyId",args.eventId)).unique();if(!e)throw new Error("Event not found");const now=Date.now();await ctx.db.patch(e._id,{status:"published",publishedAt:now,updatedAt:now});}});
export const listPublishedEvents = query({args:{},handler:async ctx=>await ctx.db.query("events").withIndex("by_status",q=>q.eq("status","published")).order("asc").collect()});
export const register = mutation({args:{eventId:v.string()},handler:async(ctx,args)=>{const user=await currentUser(ctx);const event=await ctx.db.query("events").withIndex("by_legacy_id",q=>q.eq("legacyId",args.eventId)).unique();if(!event||event.status!=="published")throw new Error("Event unavailable");const old=await ctx.db.query("eventRegistrations").withIndex("by_event",q=>q.eq("eventId",args.eventId)).collect();if(old.some(x=>x.userId===user.legacyId))return old.find(x=>x.userId===user.legacyId)!._id;const now=Date.now();return await ctx.db.insert("eventRegistrations",{eventId:args.eventId,userId:user.legacyId,status:"registered",registeredAt:now,createdAt:now,updatedAt:now});}});
export const createCompetition = mutation({args:{eventId:v.string(),title:v.string(),description:v.optional(v.string())},handler:async(ctx,args)=>{await requirePermission(ctx,"samskara.event.manage");const now=Date.now();return await ctx.db.insert("competitions",{...args,status:"open",createdAt:now,updatedAt:now});}});
export const submitEntry = mutation({args:{competitionId:v.string(),submissionFileId:v.optional(v.string())},handler:async(ctx,args)=>{const user=await currentUser(ctx);const now=Date.now();return await ctx.db.insert("competitionEntries",{...args,userId:user.legacyId,status:"submitted",createdAt:now,updatedAt:now});}});
