import type { Config } from "drizzle-kit";
import { config } from "dotenv";
config({ path: ".env.local" });

export default {
  out: "./src/server/db/migrations",
  schema: "./src/server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ["help-sonic_*"],
} satisfies Config;
