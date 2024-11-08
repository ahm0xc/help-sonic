"use server";

import { db } from "~/server/db";

export async function getUserSubscription(userId: string) {
  if (!userId) return;

  const user = await db.query.users.findFirst({
    where(table, { eq }) {
      return eq(table.id, userId);
    },
  });

  return {
    userId: user?.id,
    isSubscribed: user?.isSubscribed,
    subscriptionStatus: user?.subscriptionStatus,
    freeTokens: user?.freeTokens,
  };
}
