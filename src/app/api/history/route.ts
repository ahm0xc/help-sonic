import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { history as historyTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const histories = await db.query.history.findMany({
    where(fields, operators) {
      return operators.eq(fields.userId, userId);
    },
    orderBy(fields, operators) {
      return [operators.desc(fields.createdAt)];
    },
  });

  return new Response(JSON.stringify(histories), { status: 200 });
}
