CREATE TYPE "public"."magic_token_purpose" AS ENUM('invitation', 'forward', 'reminder', 're_issue');--> statement-breakpoint
CREATE TABLE "email_send_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_request_id" uuid,
	"participant_id" uuid,
	"contact_id" uuid,
	"email" text NOT NULL,
	"template_type" text NOT NULL,
	"status" text NOT NULL,
	"provider_message_id" text,
	"error_message" text,
	"attempts" integer DEFAULT 0,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"bounced_at" timestamp,
	"complained_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "magic_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"token_hash" text NOT NULL,
	"assessment_request_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"email" text NOT NULL,
	"purpose" "magic_token_purpose" DEFAULT 'invitation' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"revoked_at" timestamp,
	"replaced_by_token_id" uuid,
	CONSTRAINT "magic_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD COLUMN "answers" text;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "default_suppliers_data" text;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "default_suppliers_uploaded_at" timestamp;--> statement-breakpoint
ALTER TABLE "email_send_log" ADD CONSTRAINT "email_send_log_assessment_request_id_assessment_requests_id_fk" FOREIGN KEY ("assessment_request_id") REFERENCES "public"."assessment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_send_log" ADD CONSTRAINT "email_send_log_participant_id_assessment_request_suppliers_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."assessment_request_suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_send_log" ADD CONSTRAINT "email_send_log_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_tokens" ADD CONSTRAINT "magic_tokens_assessment_request_id_assessment_requests_id_fk" FOREIGN KEY ("assessment_request_id") REFERENCES "public"."assessment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_tokens" ADD CONSTRAINT "magic_tokens_participant_id_assessment_request_suppliers_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."assessment_request_suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_tokens" ADD CONSTRAINT "magic_tokens_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_tokens" ADD CONSTRAINT "magic_tokens_replaced_by_token_id_magic_tokens_id_fk" FOREIGN KEY ("replaced_by_token_id") REFERENCES "public"."magic_tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "esl_request_idx" ON "email_send_log" USING btree ("assessment_request_id");--> statement-breakpoint
CREATE INDEX "esl_participant_idx" ON "email_send_log" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "esl_contact_idx" ON "email_send_log" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "esl_status_idx" ON "email_send_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "esl_created_idx" ON "email_send_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mt_token_idx" ON "magic_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "mt_token_hash_idx" ON "magic_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "mt_request_idx" ON "magic_tokens" USING btree ("assessment_request_id");--> statement-breakpoint
CREATE INDEX "mt_participant_idx" ON "magic_tokens" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "mt_contact_idx" ON "magic_tokens" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "mt_expires_idx" ON "magic_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "mt_used_idx" ON "magic_tokens" USING btree ("used_at");