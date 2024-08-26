import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Webhook } from "svix";

import { db } from "~/server/db";
import { users, type UserInsertType } from "~/server/db/schema";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("WEBHOOK_SECRET is missing in env");
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  try {
    if (evt.type === "user.created") {
      console.info("🪝 user.created", evt.data);
      const payload: UserInsertType = {
        id: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name ?? ""} ${evt.data.last_name ?? ""}`.trim(),
        username: evt.data.username,
        imageUrl: evt.data.image_url,
      };

      await db.insert(users).values(payload);
      return new Response(`USER/CREATED:${evt.data.id}`, { status: 201 });
    }
    if (evt.type === "user.deleted") {
      console.info("🪝 user.deleted", evt.data);
      if (!evt.data.id) return new Response("Missing user id", { status: 400 });
      await db.delete(users).where(eq(users.id, evt.data.id));
      return new Response(`USER/DELETED:${evt.data.id}`, { status: 201 });
    }

    return new Response(`Unhandled event/${evt.type}:${evt.data.id}`, {
      status: 400,
    });
  } catch (error) {
    console.error("Error creating user in the database:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
