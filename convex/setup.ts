import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { currentUser } from "./auth";

const permissions = [
  "academic.department.approve","academic.cbt.create","academic.cbt.publish","academic.cbt.manage",
  "academic.cbt.results.release","academic.cbt.results.export","helpdesk.ticket.manage",
  "aashraya.request.manage","sahayi.assignment.manage","samskara.event.create","samskara.event.manage",
  "scholarx.opportunity.approve","admin.user.manage","admin.audit.view",
];
const roles: Array<[string,string]> = [
  ["student","Student"],["department_coordinator","Department Coordinator"],["module_coordinator","Module Coordinator"],
  ["moderator","Moderator"],["admin","Administrator"],["super_admin","Super Administrator"],
];

export const initialize = mutation({
  args: { secret: v.string() },
  returns: v.object({ userId: v.string(), role: v.string(), permissions: v.number() }),
  handler: async (ctx, args) => {
    if (!process.env.PLATFORM_BOOTSTRAP_SECRET || args.secret !== process.env.PLATFORM_BOOTSTRAP_SECRET) {
      throw new Error("Invalid bootstrap secret");
    }
    const user = await currentUser(ctx);
    const now = Date.now();

    for (const [key, name] of roles) {
      const old = await ctx.db.query("roles").withIndex("by_key", q => q.eq("key", key)).unique();
      if (!old) await ctx.db.insert("roles", { key, name, createdAt: now, updatedAt: now });
    }
    for (const key of permissions) {
      const old = await ctx.db.query("permissions").withIndex("by_key", q => q.eq("key", key)).unique();
      if (!old) await ctx.db.insert("permissions", { key, createdAt: now, updatedAt: now });
    }

    const existingGrants = await ctx.db.query("rolePermissions")
      .withIndex("by_role", q => q.eq("roleKey", "super_admin")).take(1000);
    const granted = new Set(existingGrants.map(x => x.permissionKey));
    for (const key of permissions) {
      if (!granted.has(key)) {
        await ctx.db.insert("rolePermissions", {
          roleKey: "super_admin", permissionKey: key, createdAt: now, updatedAt: now,
        });
      }
    }

    const existingRole = await ctx.db.query("userRoles")
      .withIndex("by_user_role", q => q.eq("userId", user.legacyId).eq("roleKey", "super_admin")).take(1);
    if (!existingRole.length) {
      await ctx.db.insert("userRoles", {
        userId: user.legacyId, roleKey: "super_admin", createdAt: now, updatedAt: now,
      });
    }
    return { userId: user.legacyId, role: "super_admin", permissions: permissions.length };
  },
});
