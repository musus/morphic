CREATE TABLE "prompt_favorites" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"template_id" varchar(191) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prompt_favorites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"category" varchar(256),
	"variables" jsonb DEFAULT '[]'::jsonb,
	"user_id" varchar(255) NOT NULL,
	"visibility" varchar(256) DEFAULT 'private' NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prompt_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "prompt_favorites" ADD CONSTRAINT "prompt_favorites_template_id_prompt_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."prompt_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prompt_favorites_user_id_idx" ON "prompt_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prompt_favorites_template_id_idx" ON "prompt_favorites" USING btree ("template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_favorites_user_template_unique" ON "prompt_favorites" USING btree ("user_id","template_id");--> statement-breakpoint
CREATE INDEX "prompt_templates_user_id_idx" ON "prompt_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prompt_templates_visibility_use_count_idx" ON "prompt_templates" USING btree ("visibility","use_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "prompt_templates_category_idx" ON "prompt_templates" USING btree ("category");--> statement-breakpoint
CREATE POLICY "users_manage_own_favorites" ON "prompt_favorites" AS PERMISSIVE FOR ALL TO public USING (user_id = current_setting('app.current_user_id', true)) WITH CHECK (user_id = current_setting('app.current_user_id', true));--> statement-breakpoint
CREATE POLICY "users_manage_own_templates" ON "prompt_templates" AS PERMISSIVE FOR ALL TO public USING (user_id = current_setting('app.current_user_id', true)) WITH CHECK (user_id = current_setting('app.current_user_id', true));--> statement-breakpoint
CREATE POLICY "public_templates_readable" ON "prompt_templates" AS PERMISSIVE FOR SELECT TO public USING (visibility = 'public');