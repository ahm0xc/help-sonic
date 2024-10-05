"use server";

import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { users as usersTable } from "~/server/db/schema";

export default async function decrementFreeToken(count = 1) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(usersTable)
    .set({
      freeTokens: sql`${usersTable.freeTokens} - ${count.toString()}`,
    })
    .where(eq(usersTable.id, userId));

  revalidatePath("/");
}
