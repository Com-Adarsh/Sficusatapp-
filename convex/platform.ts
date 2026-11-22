import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ensureUser, currentUser, requirePermission } from "./auth";

export const bootstrap = mutation({
  args: {},
  returns: v.object({ userId: v.string(), fullName: v.string(), email: v.string() }),
  handler: async (ctx) => {
    const user = await ensureUser(ctx);
    return { userId: user!.legacyId, fullName: user!.fullName, email: user!.email };
  },
});

export const me = query({
  args: {},
  returns: v.union(v.null(), v.object({
    userId: v.string(), fullName: v.string(), email: v.string(), status: v.string(),
    roles: v.array(v.string()),
  })),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db.query("users").withIndex("by_legacy_id", q => q.eq("legacyId", identity.subject)).unique();
    if (!user) return null;
    const roles = await ctx.db.query("userRoles").withIndex("by_user", q => q.eq("userId", user.legacyId)).collect();
    return { userId: user.legacyId, fullName: user.fullName, email: user.email, status: user.status, roles: roles.map(r => r.roleKey) };
  },
});

export const listDepartments = query({
  args: { includePending: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const rows = args.includePending
      ? await ctx.db.query("departments").collect()
      : await ctx.db.query("departments").withIndex("by_status", q => q.eq("status", "published")).collect();
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const submitDepartment = mutation({
  args: {
    legacyId: v.string(), name: v.string(), shortName: v.optional(v.string()),
    description: v.optional(v.string()), officialEmail: v.optional(v.string()),
    website: v.optional(v.string()), building: v.optional(v.string()), room: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    const existing = await ctx.db.query("departments").withIndex("by_legacy_id", q => q.eq("legacyId", args.legacyId)).unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("departments", { ...args, status: "pending", createdBy: user.legacyId, createdAt: now, updatedAt: now });
  },
});

export const reviewDepartment = mutation({
  args: { departmentId: v.string(), status: v.union(v.literal("published"), v.literal("rejected")) },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "academic.department.approve");
    const dep = await ctx.db.query("departments").withIndex("by_legacy_id", q => q.eq("legacyId", args.departmentId)).unique();
    if (!dep) throw new Error("Department not found");
    await ctx.db.patch(dep._id, { status: args.status, verifiedAt: Date.now(), updatedAt: Date.now() });
    await ctx.db.insert("auditLogs", { actorUserId: user.legacyId, action: "department.review", entityType: "department", entityId: args.departmentId, afterData: JSON.stringify({ status: args.status }), createdAt: Date.now() });
  },
});

export const createFileUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await currentUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, args) => ctx.storage.getUrl(args.storageId),
});

export const markNotificationRead = mutation({
  args: { notificationId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await currentUser(ctx);
    const n = await ctx.db.query("notifications").withIndex("by_legacy_id", q => q.eq("legacyId", args.notificationId)).unique();
    if (!n || n.userId !== user.legacyId) throw new Error("Notification not found");
    await ctx.db.patch(n._id, { readAt: Date.now(), updatedAt: Date.now() });
    return null;
  },
});

export const myNotifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    return await ctx.db.query("notifications").withIndex("by_user_created", q => q.eq("userId", user.legacyId)).order("desc").take(50);
  },
});

export const myAcademicProfile = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      userId: v.string(),
      fullName: v.string(),
      email: v.string(),
      studentId: v.union(v.null(), v.string()),
      rollNumber: v.union(v.null(), v.string()),
      departmentId: v.union(v.null(), v.string()),
      programme: v.union(v.null(), v.string()),
      semester: v.union(v.null(), v.number()),
      year: v.union(v.null(), v.number()),
      scheme: v.union(v.null(), v.string()),
      campus: v.union(v.null(), v.string()),
      verificationStatus: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db.query("users").withIndex("by_legacy_id", (q) => q.eq("legacyId", identity.subject)).unique();
    if (!user) return null;
    const profile = await ctx.db.query("studentProfiles").withIndex("by_user", (q) => q.eq("userId", user.legacyId)).unique();
    if (!profile) return {
      userId: user.legacyId, fullName: user.fullName, email: user.email,
      studentId: null, rollNumber: null, departmentId: null, programme: null,
      semester: null, year: null, scheme: null, campus: null, verificationStatus: "incomplete",
    };
    return {
      userId: user.legacyId, fullName: user.fullName, email: user.email,
      studentId: profile.studentId ?? null, rollNumber: profile.rollNumber ?? null,
      departmentId: profile.departmentId ?? null, programme: profile.programme ?? null,
      semester: profile.semester ?? null, year: profile.year ?? null,
      scheme: profile.scheme ?? null, campus: profile.campus ?? null,
      verificationStatus: profile.verificationStatus,
    };
  },
});

export const saveAcademicProfile = mutation({
  args: {
    studentId: v.optional(v.string()), rollNumber: v.optional(v.string()),
    departmentId: v.optional(v.string()), programme: v.optional(v.string()),
    semester: v.optional(v.number()), year: v.optional(v.number()),
    scheme: v.optional(v.string()), campus: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);
    if (!user) throw new Error("Unable to provision user");
    const now = Date.now();
    const existing = await ctx.db.query("studentProfiles").withIndex("by_user", (q) => q.eq("userId", user.legacyId)).unique();
    const payload = { ...args, userId: user.legacyId, verificationStatus: "self_declared", updatedAt: now };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return String(existing._id);
    }
    const id = await ctx.db.insert("studentProfiles", { ...payload, createdAt: now });
    return String(id);
  },
});


export const listPublishedResources = query({
  args: {
    departmentId: v.optional(v.string()),
    programme: v.optional(v.string()),
    semester: v.optional(v.number()),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("resources")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const search = args.search?.trim().toLowerCase();

    return rows
      .filter((resource) => {
        if (args.departmentId && resource.departmentId !== args.departmentId) return false;
        if (args.programme && resource.programme !== args.programme) return false;
        if (args.semester && resource.semester !== args.semester) return false;
        if (args.category && resource.category !== args.category) return false;
        if (search) {
          const haystack = [
            resource.title,
            resource.description ?? "",
            resource.programme ?? "",
            resource.subject ?? "",
            resource.category,
          ].join(" ").toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt))
      .slice(0, 100);
  },
});
