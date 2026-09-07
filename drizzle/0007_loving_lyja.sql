CREATE TYPE "public"."assessment_request_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TYPE "public"."assessment_template_category" AS ENUM('code_of_conduct', 'esg_document_request', 'esg_supplier_self_assessment_labor_rights', 'esg_supplier_self_assessment_human_rights', 'esg_supplier_self_assessment_environmental_rights', 'esg_self_assessment_egb', 'reach_enquiry', 'rohs_enquiry', 'supplier_self_assessment_pma_code_of_conduct');--> statement-breakpoint
CREATE TYPE "public"."document_template_category" AS ENUM('certification', 'agreement', 'policy', 'compliance', 'other');--> statement-breakpoint
CREATE TABLE "assessment_document_request_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_request_id" uuid NOT NULL,
	"label" text NOT NULL,
	"allow_additional_attachments" boolean DEFAULT true,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_document_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"document_template_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_answer_required" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_request_suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_request_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"contact_id" uuid,
	"status" text DEFAULT 'pending',
	"sent_at" timestamp,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"responsible_id" uuid NOT NULL,
	"team_ids" text[],
	"due_date" timestamp,
	"status" "assessment_request_status" DEFAULT 'draft',
	"template_id" uuid,
	"message_body" text,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_request_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"contact_id" uuid,
	"document_request_id" uuid,
	"response_text" text,
	"document_url" text,
	"submitted_at" timestamp,
	"reviewed_by_id" uuid,
	"reviewed_at" timestamp,
	"review_notes" text,
	"status" text DEFAULT 'submitted',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "assessment_template_category" NOT NULL,
	"config" text,
	"is_active" boolean DEFAULT true,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "document_template_category" NOT NULL,
	"file_url" text,
	"is_active" boolean DEFAULT true,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "email_verification_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "assessment_document_request_groups" ADD CONSTRAINT "assessment_document_request_groups_assessment_request_id_assessment_requests_id_fk" FOREIGN KEY ("assessment_request_id") REFERENCES "public"."assessment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_document_requests" ADD CONSTRAINT "assessment_document_requests_group_id_assessment_document_request_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."assessment_document_request_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_document_requests" ADD CONSTRAINT "assessment_document_requests_document_template_id_document_templates_id_fk" FOREIGN KEY ("document_template_id") REFERENCES "public"."document_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_request_suppliers" ADD CONSTRAINT "assessment_request_suppliers_assessment_request_id_assessment_requests_id_fk" FOREIGN KEY ("assessment_request_id") REFERENCES "public"."assessment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_request_suppliers" ADD CONSTRAINT "assessment_request_suppliers_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_request_suppliers" ADD CONSTRAINT "assessment_request_suppliers_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_requests" ADD CONSTRAINT "assessment_requests_responsible_id_users_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_requests" ADD CONSTRAINT "assessment_requests_template_id_assessment_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."assessment_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_requests" ADD CONSTRAINT "assessment_requests_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_assessment_request_id_assessment_requests_id_fk" FOREIGN KEY ("assessment_request_id") REFERENCES "public"."assessment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_document_request_id_assessment_document_requests_id_fk" FOREIGN KEY ("document_request_id") REFERENCES "public"."assessment_document_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "drg_request_idx" ON "assessment_document_request_groups" USING btree ("assessment_request_id");--> statement-breakpoint
CREATE INDEX "dr_group_idx" ON "assessment_document_requests" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "dr_template_idx" ON "assessment_document_requests" USING btree ("document_template_id");--> statement-breakpoint
CREATE INDEX "ars_request_idx" ON "assessment_request_suppliers" USING btree ("assessment_request_id");--> statement-breakpoint
CREATE INDEX "ars_supplier_idx" ON "assessment_request_suppliers" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "ars_status_idx" ON "assessment_request_suppliers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ar_status_idx" ON "assessment_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ar_responsible_idx" ON "assessment_requests" USING btree ("responsible_id");--> statement-breakpoint
CREATE INDEX "ar_template_idx" ON "assessment_requests" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "ar_created_by_idx" ON "assessment_requests" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "resp_request_idx" ON "assessment_responses" USING btree ("assessment_request_id");--> statement-breakpoint
CREATE INDEX "resp_supplier_idx" ON "assessment_responses" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "resp_doc_req_idx" ON "assessment_responses" USING btree ("document_request_id");--> statement-breakpoint
CREATE INDEX "resp_status_idx" ON "assessment_responses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "template_category_idx" ON "assessment_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "template_active_idx" ON "assessment_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "doc_template_category_idx" ON "document_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "doc_template_active_idx" ON "document_templates" USING btree ("is_active");