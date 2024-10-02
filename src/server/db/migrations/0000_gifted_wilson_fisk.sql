CREATE TABLE IF NOT EXISTS "help-sonic_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"response" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "help-sonic_subscription_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" varchar,
	"event_payload" jsonb NOT NULL,
	"email" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "help-sonic_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"username" varchar(255),
	"email" varchar(255) NOT NULL,
	"image_url" text,
	"is_subscribed" boolean DEFAULT false NOT NULL,
	"subscription_status" varchar(50),
	"invoice_status" varchar(50),
	"current_plan" varchar(50),
	"next_invoice_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "help-sonic_history" ADD CONSTRAINT "help-sonic_history_user_id_help-sonic_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."help-sonic_users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "help-sonic_users" USING btree ("email");