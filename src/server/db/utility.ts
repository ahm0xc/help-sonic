import { pgTableCreator } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const createTable = pgTableCreator((name) => `help-sonic_${name}`);
export function generateId(length = 10) {
  return nanoid(length);
}
