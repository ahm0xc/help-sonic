import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { subscriptionEvents, users } from "~/server/db/schema";

export async function constructStripeEvent(
  req: NextRequest,
  stripe: Stripe
): Promise<{ event?: Stripe.Event; error?: NextResponse }> {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return { event };
  } catch (err) {
    const error = createErrorResponse(err);
    return { error };
  }
}

function createErrorResponse(err: unknown): NextResponse {
  if (err instanceof Error) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
  return NextResponse.json({ error: "Unknown error" }, { status: 500 });
}

export async function retrieveSubscription(
  event: Stripe.Event,
  stripe: Stripe
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(
    (event.data.object as Stripe.Subscription).id,
    { expand: ["customer"] }
  );

  return subscription;
}

export function getCustomerEmail(subscription: Stripe.Subscription): string {
  const customerEmail = (subscription.customer as Stripe.Customer).email;
  if (!customerEmail) {
    throw new Error(
      `Customer email not found for subscription: ${subscription.id}`
    );
  }

  return customerEmail;
}

export function getCurrentPlan(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0].plan.id;
  if (priceId === process.env.PRICE_ID_SUB_BASE_PLAN) {
    return "base";
  }
  //   else if (priceId === process.env.PRICE_ID_SUBSCRIBER_PRO) {
  //     return "PRO";
  //   }

  throw new Error(`Unknown or unsupported price ID ${priceId}`);
}

export async function updateSubscribedUser(
  customerEmail: string,
  subscription: Stripe.Subscription,
  subscriptionType: string
) {
  // If the subscription is set to cancel at the end of the period, set the next invoice date to null
  const nextInvoiceDate = subscription.cancel_at_period_end
    ? null
    : new Date(subscription.current_period_end * 1000);

  await db
    .update(users)
    .set({
      isSubscribed: true,
      subscriptionStatus: subscription.status,
      currentPlan: subscriptionType,
      nextInvoiceDate,
    })
    .where(eq(users.email, customerEmail));
}

export async function recordSubscriptionEvent(
  event: Stripe.Event,
  customerEmail: string
) {
  await db.insert(subscriptionEvents).values({
    eventId: event.id,
    eventPayload: event,
    email: customerEmail,
  });
}

export function handleError(
  err: unknown,
  customerEmail: string | null | undefined,
  updates: string[],
  errors: string[]
): NextResponse {
  const errorMessage = err instanceof Error ? err.message : "Unknown error";
  errors.push(`Error occurred at payment-success db update: ${errorMessage}`);

  return NextResponse.json(
    {
      received: true,
      email: customerEmail || "missing email",
      updates,
      errors,
    },
    { status: 500 }
  );
}

export function getCustomerEmailFromInvoice(invoice: Stripe.Invoice): string {
  const customerEmail = invoice.customer_email;
  if (!customerEmail) {
    throw new Error(`Customer email not found for invoice: ${invoice.id}`);
  }
  return customerEmail;
}

export async function updateInvoiceStatus(
  customerEmail: string,
  status: string
) {
  await db
    .update(users)
    .set({ invoiceStatus: status })
    .where(eq(users.email, customerEmail));
}

export async function resetSubscription(customerEmail: string) {
  await db
    .update(users)
    .set({
      isSubscribed: false,
      subscriptionStatus: null,
      currentPlan: null,
      invoiceStatus: null,
      nextInvoiceDate: null,
    })
    .where(eq(users.email, customerEmail));
}
