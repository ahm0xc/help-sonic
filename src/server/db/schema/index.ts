import {
  boolean,
  integer,
  jsonb,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { createTable, generateId } from "../utility";

export const users = createTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 255 }),
    username: varchar("username", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    imageUrl: text("image_url"),

    freeTokens: integer("free_tokens").default(10).notNull(),

    // stripe
    isSubscribed: boolean("is_subscribed").notNull().default(false),
    subscriptionStatus: varchar("subscription_status", { length: 50 }),
    invoiceStatus: varchar("invoice_status", { length: 50 }),
    currentPlan: varchar("current_plan", { length: 50 }),
    nextInvoiceDate: timestamp("next_invoice_date"),

    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("email_idx").on(t.email),
  }),
);

export type UserSelectType = typeof users.$inferSelect;
export type UserInsertType = typeof users.$inferInsert;

export const subscriptionEvents = createTable("subscription_events", {
  id: text("id").primaryKey().$defaultFn(generateId),
  eventId: varchar("event_id"),
  eventPayload: jsonb("event_payload").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
});

export const history = createTable("history", {
  id: text("id").primaryKey().$defaultFn(generateId),

  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  response: text("response").notNull(),
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});
