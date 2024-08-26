import { serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createTable } from "../utility";

export const users = createTable("users", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  imageUrl: text("image_url"),

  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export type UserSelectType = typeof users.$inferSelect;
export type UserInsertType = typeof users.$inferInsert;
