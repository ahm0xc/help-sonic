"use server";

import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { z } from "zod";

import { db } from "~/server/db";
import { users as usersTable } from "~/server/db/schema";
import { openai } from "@ai-sdk/openai";

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

export async function extractRTFFromText(text: string) {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({
      role: z.string(),
      task: z.string(),
      format: z.string(),
    }),
    prompt: `Here are some examples of how to extract role, task and format from text.\n
### Example 1
- **Text**: "Hey, I want to create an extension that blocks me from accessing social media, and I can add custom blocking."
- **Role**: Extension Developer
- **Task**: Create an extension that blocks social media and allows custom blocking.
- **Format**: Provide step-by-step instructions and include configuration options for custom blocking.
---
### Example 2
- **Text**: "I need a system that tracks my daily work hours and sends me a report."
- **Role**: Time Management System Designer
- **Task**: Design a system that tracks daily work hours and sends reports.
- **Format**: Include hourly breakdowns and a final summary in the report.
---
### Example 3
- **Text**: "Build me an app that reminds me of my to-do tasks, and I can mark them complete."
- **Role**: Mobile App Developer
- **Task**: Develop a to-do reminder app with task completion functionality.
- **Format**: Use a clean interface with checkboxes for task completion.
---
### Example 4
- **Text**: "Create a website that showcases my portfolio and lets clients contact me."
- **Role**: Web Designer
- **Task**: Design a portfolio website with a contact form for client inquiries.
- **Format**: Use a minimalistic layout with section headers.
---
### Example 5
- **Text**: "I'd like a tool that blocks distracting websites when I'm working."
- **Role**: Productivity Tool Developer
- **Task**: Build a tool that blocks distracting websites during work hours.
- **Format**: Provide an on/off toggle and list blocked websites.
---
### Example 6
- **Text**: "I want an AI assistant that writes blog posts for me about technology trends."
- **Role**: Content Creator
- **Task**: Design an AI assistant to generate blog posts about technology trends.
- **Format**: Include headings, subheadings, and bullet points for key trends.
---
### Example 7
- **Text**: "I need an app that helps me track my expenses and categorize them."
- **Role**: Finance App Developer
- **Task**: Create an expense tracking app with category management.
- **Format**: Include pie charts and monthly expense summaries.
---
### Example 8
- **Text**: "Develop a chatbot that answers customer questions about my product."
- **Role**: Chatbot Developer
- **Task**: Build a chatbot to answer product-related questions.
- **Format**: Include short, conversational responses with links to FAQs.
---
### Example 9
- **Text**: "I need a tool that summarizes long research papers for me."
- **Role**: Researcher
- **Task**: Create a tool that summarizes lengthy research papers.
- **Format**: Provide bullet points for key findings and a final summary.
---
### Example 10
- **Text**: "Create a reminder system that sends me text notifications for meetings."
- **Role**: Meeting Scheduler
- **Task**: Build a reminder system for text notifications about upcoming meetings.
- **Format**: Use concise notification messages with time and date.
---

The Text: ${text}`,
  });

  return object;
}
