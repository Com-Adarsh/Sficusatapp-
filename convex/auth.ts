import type { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity;
}

export async function currentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db.query("users").withIndex("by_legacy_id", q => q.eq("legacyId", identity.subject)).unique();
  if (!user) throw new Error("User profile not provisioned");
  return user;
}

export async function ensureUser(ctx: MutationCtx) {
  const identity = await requireIdentity(ctx);
  const existing = await ctx.db.query("users").withIndex("by_legacy_id", q => q.eq("legacyId", identity.subject)).unique();
  const now = Date.now();
  if (existing) {
    if (existing.email !== (identity.email ?? existing.email) || existing.fullName !== (identity.name ?? existing.fullName)) {
      await ctx.db.patch(existing._id, {
        email: identity.email ?? existing.email,
        fullName: identity.name ?? existing.fullName,
        updatedAt: now,
      });
    }
    return existing;
  }
  const email = identity.email ?? "";
  const fullName = identity.name ?? email.split("@")[0] ?? "Student";
  const id = await ctx.db.insert("users", {
    legacyId: identity.subject,
    email,
    fullName,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  return await ctx.db.get(id);
}

export async function hasPermission(ctx: QueryCtx | MutationCtx, userId: string, permissionKey: string) {
  const roles = await ctx.db.query("userRoles").withIndex("by_user", q => q.eq("userId", userId)).collect();
  for (const role of roles) {
    const grant = await ctx.db.query("rolePermissions").withIndex("by_role", q => q.eq("roleKey", role.roleKey)).collect();
    if (grant.some(p => p.permissionKey === permissionKey || p.permissionKey === "*")) return true;
  }
  return false;
}

export async function requirePermission(ctx: QueryCtx | MutationCtx, permissionKey: string) {
  const user = await currentUser(ctx);
  if (!(await hasPermission(ctx, user.legacyId, permissionKey))) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireRole(ctx: QueryCtx | MutationCtx, roleKey: string) {
  const user = await currentUser(ctx);
  const roles = await ctx.db.query("userRoles").withIndex("by_user_role", q => q.eq("userId", user.legacyId).eq("roleKey", roleKey)).collect();
  if (!roles.length) throw new Error("Forbidden");
  return user;
}
