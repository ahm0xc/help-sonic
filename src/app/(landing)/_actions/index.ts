"use server";

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";
import { db } from "~/server/db";
import { history } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function generate(input: string) {
  const stream = createStreamableValue("");

  (async () => {
    const { textStream } = await streamText({
      model: openai("gpt-4o"),
      prompt: input,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}

export async function saveHistory(
  response: string,
  metadata: Record<string, any>,
) {
  const { userId } = auth();
  if (!userId) {
    return { error: "User not logged in" };
  }
  try {
    await db.insert(history).values({
      response,
      metadata,
      userId: userId!,
    });
  } catch (error) {
    return { error: "Failed to save history" };
  }
}
