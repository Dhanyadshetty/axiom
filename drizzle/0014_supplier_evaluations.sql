CREATE TYPE "supplier_evaluation_status" AS ENUM('draft', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "supplier_evaluation_template_category" AS ENUM('esg_risk_own_business_area', 'esg_risk_occasion_based', 'esg_risk_supplier_self_assessment', 'esg_risk_mitigation_factors', 'other');--> statement-breakpoint
CREATE TABLE "supplier_evaluation_templates" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "description" text,
    "category" "supplier_evaluation_template_category" DEFAULT 'other' NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_by_id" uuid REFERENCES users(id),
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint
CREATE TABLE "supplier_evaluations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "supplier_id" uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    "template_id" uuid NOT NULL REFERENCES supplier_evaluation_templates(id),
    "title" text NOT NULL,
    "language" text DEFAULT 'en',
    "status" "supplier_evaluation_status" DEFAULT 'draft',
    "notes" text,
    "created_by_id" uuid REFERENCES users(id),
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);--> statement-breakpoint
CREATE INDEX "supplier_eval_tpl_active_idx" ON "supplier_evaluation_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "supplier_eval_tpl_category_idx" ON "supplier_evaluation_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "supplier_eval_supplier_idx" ON "supplier_evaluations" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "supplier_eval_template_idx" ON "supplier_evaluations" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "supplier_eval_status_idx" ON "supplier_evaluations" USING btree ("status");
