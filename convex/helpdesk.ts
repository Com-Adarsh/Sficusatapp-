import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { currentUser, requirePermission } from "./auth";

export const createTicket = mutation({
  args: { legacyId: v.string(), category: v.string(), subcategory: v.optional(v.string()), title: v.string(), description: v.string(), priority: v.string(), departmentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx); const now = Date.now();
    return await ctx.db.insert("helpdeskTickets", { ...args, createdBy: user.legacyId, status: "open", createdAt: now, updatedAt: now });
  },
});

export const myTickets = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    return await ctx.db.query("helpdeskTickets").withIndex("by_creator", q => q.eq("createdBy", user.legacyId)).order("desc").collect();
  },
});

export const listManageableTickets = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "helpdesk.ticket.manage");
    return args.status
      ? await ctx.db.query("helpdeskTickets").withIndex("by_status", q => q.eq("status", args.status!)).order("desc").collect()
      : await ctx.db.query("helpdeskTickets").order("desc").take(100);
  },
});

export const addMessage = mutation({
  args: { ticketId: v.string(), message: v.string(), attachmentFileId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    const ticket = await ctx.db.query("helpdeskTickets").withIndex("by_legacy_id", q => q.eq("legacyId", args.ticketId)).unique();
    if (!ticket || (ticket.createdBy !== user.legacyId && !(await requirePermission(ctx, "helpdesk.ticket.manage")))) throw new Error("Forbidden");
    const now = Date.now();
    return await ctx.db.insert("ticketMessages", { ...args, senderId: user.legacyId, createdAt: now, updatedAt: now });
  },
});

export const messages = query({
  args: { ticketId: v.string() },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    const ticket = await ctx.db.query("helpdeskTickets").withIndex("by_legacy_id", q => q.eq("legacyId", args.ticketId)).unique();
    if (!ticket) throw new Error("Ticket not found");
    if (ticket.createdBy !== user.legacyId) await requirePermission(ctx, "helpdesk.ticket.manage");
    return await ctx.db.query("ticketMessages").withIndex("by_ticket", q => q.eq("ticketId", args.ticketId)).order("asc").collect();
  },
});

export const updateTicket = mutation({
  args: { ticketId: v.string(), status: v.string(), priority: v.optional(v.string()), assignedTo: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "helpdesk.ticket.manage");
    const ticket = await ctx.db.query("helpdeskTickets").withIndex("by_legacy_id", q => q.eq("legacyId", args.ticketId)).unique();
    if (!ticket) throw new Error("Ticket not found");
    const now = Date.now();
    await ctx.db.patch(ticket._id, { status: args.status, priority: args.priority ?? ticket.priority, assignedTo: args.assignedTo ?? ticket.assignedTo, resolvedAt: args.status === "resolved" ? now : ticket.resolvedAt, updatedAt: now });
    await ctx.db.insert("issueActions", { ticketId: args.ticketId, actorUserId: user.legacyId, action: "status_changed", note: args.status, createdAt: now, updatedAt: now });
  },
});

export const escalate = mutation({
  args: { ticketId: v.string(), toUserId: v.optional(v.string()), reason: v.string() },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "helpdesk.ticket.manage"); const now = Date.now();
    return await ctx.db.insert("issueEscalations", { ...args, fromUserId: user.legacyId, status: "open", createdAt: now, updatedAt: now });
  },
});
