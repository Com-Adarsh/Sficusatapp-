import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ensureUser } from "./auth";

const DAILY_LIMIT = 20;

export const consumeDailyQuota = mutation({
  args: {},
  returns: v.object({
    allowed: v.boolean(),
    remaining: v.number(),
    limit: v.number(),
    dayKey: v.string(),
  }),
  handler: async (ctx) => {
    const user = await ensureUser(ctx);
    if (!user) throw new Error("User profile could not be provisioned");

    const dayKey = new Date().toISOString().slice(0, 10);
    const existing = await ctx.db
      .query("aiUsageDaily")
      .withIndex("by_user_day", (q) =>
        q.eq("userId", user.legacyId).eq("dayKey", dayKey),
      )
      .unique();

    const current = existing?.messageCount ?? 0;
    if (current >= DAILY_LIMIT) {
      return { allowed: false, remaining: 0, limit: DAILY_LIMIT, dayKey };
    }

    const nextCount = current + 1;
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        messageCount: nextCount,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("aiUsageDaily", {
        userId: user.legacyId,
        dayKey,
        messageCount: nextCount,
        updatedAt: now,
      });
    }

    return {
      allowed: true,
      remaining: DAILY_LIMIT - nextCount,
      limit: DAILY_LIMIT,
      dayKey,
    };
  },
});
