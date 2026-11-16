import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { currentUser, requirePermission } from "./auth";

export const submit = mutation({
  args:{legacyId:v.string(),title:v.string(),description:v.optional(v.string()),organization:v.optional(v.string()),category:v.string(),eligibility:v.optional(v.string()),location:v.optional(v.string()),mode:v.optional(v.string()),deadline:v.optional(v.number()),applicationUrl:v.optional(v.string()),sourceUrl:v.optional(v.string())},
  handler:async(ctx,args)=>{const user=await currentUser(ctx);const now=Date.now();return await ctx.db.insert("opportunities",{...args,status:"pending",createdBy:user.legacyId,createdAt:now,updatedAt:now});}
});
export const published = query({args:{category:v.optional(v.string())},handler:async(ctx,args)=>{const rows=args.category?await ctx.db.query("opportunities").withIndex("by_category",q=>q.eq("category",args.category!)).collect():await ctx.db.query("opportunities").withIndex("by_status_deadline",q=>q.eq("status","published")).collect();return rows.filter(x=>x.status==="published").sort((a,b)=>(a.deadline??Infinity)-(b.deadline??Infinity));}});
export const review = mutation({args:{opportunityId:v.string(),status:v.union(v.literal("published"),v.literal("rejected"))},handler:async(ctx,args)=>{const user=await requirePermission(ctx,"scholarx.opportunity.approve");const row=await ctx.db.query("opportunities").withIndex("by_legacy_id",q=>q.eq("legacyId",args.opportunityId)).unique();if(!row)throw new Error("Opportunity not found");const now=Date.now();await ctx.db.patch(row._id,{status:args.status,verifiedBy:user.legacyId,publishedAt:args.status==="published"?now:row.publishedAt,updatedAt:now});}});
