CREATE TYPE "public"."order_status" AS ENUM('draft', 'sent', 'fulfilled', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."supplier_status" AS ENUM('active', 'inactive', 'blacklisted');--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"stock_level" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "parts_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "procurement_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'draft',
	"total_amount" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contact_email" text NOT NULL,
	"status" "supplier_status" DEFAULT 'active',
	"risk_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_procurement_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."procurement_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;
CREATE TYPE "public"."doc_type" AS ENUM('contract', 'invoice', 'quote', 'license', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'warning', 'success', 'error');--> statement-breakpoint
CREATE TYPE "public"."rfq_status" AS ENUM('draft', 'open', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."rfq_supplier_status" AS ENUM('invited', 'quoted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."supplier_lifecycle" AS ENUM('prospect', 'onboarding', 'active', 'suspended', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'supplier');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"details" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"order_id" uuid,
	"rfq_id" uuid,
	"name" text NOT NULL,
	"type" "doc_type" DEFAULT 'other',
	"url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" DEFAULT 'info',
	"is_read" text DEFAULT 'no',
	"link" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform_name" text DEFAULT 'Axiom' NOT NULL,
	"default_currency" text DEFAULT 'INR' NOT NULL,
	"is_settings_locked" text DEFAULT 'no' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rfq_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rfq_suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" "rfq_supplier_status" DEFAULT 'invited',
	"quote_amount" numeric(10, 2),
	"ai_analysis" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "rfq_status" DEFAULT 'draft',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_performance_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"recorded_at" timestamp DEFAULT now(),
	"delivery_rate" numeric(5, 2) NOT NULL,
	"quality_score" numeric(5, 2) NOT NULL,
	"collaboration_score" integer NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"employee_id" text,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'user',
	"supplier_id" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "price" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "market_trend" text DEFAULT 'stable';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "lifecycle_status" "supplier_lifecycle" DEFAULT 'prospect';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "performance_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "esg_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "financial_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "on_time_delivery_rate" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "defect_rate" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "collaboration_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "responsiveness_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "categories" text[];--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "last_audit_date" timestamp;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "last_risk_audit" timestamp;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_order_id_procurement_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."procurement_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_suppliers" ADD CONSTRAINT "rfq_suppliers_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfq_suppliers" ADD CONSTRAINT "rfq_suppliers_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_performance_logs" ADD CONSTRAINT "supplier_performance_logs_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notif_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notif_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "rfq_supplier_rfq_idx" ON "rfq_suppliers" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "rfq_supplier_supplier_idx" ON "rfq_suppliers" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "rfq_supplier_status_idx" ON "rfq_suppliers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "perf_supplier_idx" ON "supplier_performance_logs" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "recorded_at_idx" ON "supplier_performance_logs" USING btree ("recorded_at");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_id_idx" ON "users" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "sku_idx" ON "parts" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "category_idx" ON "parts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "supplier_status_idx" ON "suppliers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "supplier_lifecycle_idx" ON "suppliers" USING btree ("lifecycle_status");
CREATE TYPE "public"."abc_classification" AS ENUM('A', 'B', 'C', 'X', 'Y', 'Z', 'None');--> statement-breakpoint
CREATE TYPE "public"."conflict_minerals_status" AS ENUM('compliant', 'non_compliant', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('draft', 'active', 'expired', 'terminated', 'pending_renewal');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('framework_agreement', 'nda', 'service_agreement', 'one_off');--> statement-breakpoint
CREATE TYPE "public"."incoterms" AS ENUM('EXW', 'FCA', 'CPT', 'CIP', 'DAT', 'DAP', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF');--> statement-breakpoint
CREATE TYPE "public"."inspection_status" AS ENUM('pending', 'passed', 'failed', 'conditional');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('pending', 'matched', 'disputed', 'paid');--> statement-breakpoint
CREATE TYPE "public"."renewal_status" AS ENUM('auto_renew', 'manual', 'none');--> statement-breakpoint
CREATE TYPE "public"."requisition_status" AS ENUM('draft', 'pending_approval', 'approved', 'rejected', 'converted_to_po');--> statement-breakpoint
CREATE TYPE "public"."telemetry_type" AS ENUM('event', 'metric', 'error', 'security');--> statement-breakpoint
CREATE TYPE "public"."tier_level" AS ENUM('tier_1', 'tier_2', 'tier_3', 'critical');--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'pending_approval' BEFORE 'sent';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'approved' BEFORE 'sent';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'rejected' BEFORE 'sent';--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "contract_type" DEFAULT 'one_off',
	"status" "contract_status" DEFAULT 'draft',
	"value" numeric(12, 2) DEFAULT '0',
	"valid_from" timestamp,
	"valid_to" timestamp,
	"notice_period" integer DEFAULT 30,
	"renewal_status" "renewal_status" DEFAULT 'manual',
	"incoterms" "incoterms",
	"sla_kpis" text,
	"document_url" text,
	"ai_extracted_data" text,
	"liability_cap" numeric(12, 2),
	"price_lock_expiry" timestamp,
	"auto_renewal_alert" text DEFAULT 'true',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goods_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"received_by_id" uuid NOT NULL,
	"received_at" timestamp DEFAULT now(),
	"notes" text,
	"inspection_status" "inspection_status" DEFAULT 'pending',
	"inspection_notes" text
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"status" "invoice_status" DEFAULT 'pending',
	"matched_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qc_inspections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_id" uuid NOT NULL,
	"inspector_id" uuid NOT NULL,
	"status" "inspection_status" DEFAULT 'pending',
	"checklist_results" text,
	"visual_inspection_passed" text DEFAULT 'no',
	"quantity_verified" text DEFAULT 'no',
	"document_match" text DEFAULT 'no',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "requisitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"requested_by_id" uuid NOT NULL,
	"status" "requisition_status" DEFAULT 'draft',
	"estimated_amount" numeric(12, 2) DEFAULT '0',
	"department" text,
	"purchase_order_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_telemetry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "telemetry_type" DEFAULT 'event',
	"scope" text NOT NULL,
	"key" text NOT NULL,
	"value" numeric(12, 4),
	"metadata" text,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP INDEX "email_idx";--> statement-breakpoint
DROP INDEX "role_idx";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "contract_id" uuid;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "abc_classification" "abc_classification" DEFAULT 'None';--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "reorder_point" integer DEFAULT 50;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "min_stock_level" integer DEFAULT 20;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "contract_id" uuid;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "requisition_id" uuid;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "incoterms" text;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "asn_number" text;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "carrier" text;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "tracking_number" text;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "estimated_arrival" timestamp;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "initial_quote_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "savings_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD COLUMN "savings_type" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "abc_classification" "abc_classification" DEFAULT 'None';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "carbon_footprint_scope_1" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "carbon_footprint_scope_2" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "carbon_footprint_scope_3" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "conflict_minerals_status" "conflict_minerals_status" DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "iso_certifications" text[];--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "esg_environment_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "esg_social_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "esg_governance_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "financial_health_rating" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "tier_level" "tier_level" DEFAULT 'tier_3';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "is_conflict_mineral_compliant" text DEFAULT 'no';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "modern_slavery_statement" text DEFAULT 'no';--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_order_id_procurement_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."procurement_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_received_by_id_users_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_procurement_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."procurement_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qc_inspections" ADD CONSTRAINT "qc_inspections_receipt_id_goods_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."goods_receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qc_inspections" ADD CONSTRAINT "qc_inspections_inspector_id_users_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_purchase_order_id_procurement_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."procurement_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_telemetry" ADD CONSTRAINT "system_telemetry_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contract_supplier_idx" ON "contracts" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "contract_status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "telemetry_type_idx" ON "system_telemetry" USING btree ("type");--> statement-breakpoint
CREATE INDEX "telemetry_scope_idx" ON "system_telemetry" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "telemetry_created_idx" ON "system_telemetry" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_requisition_id_requisitions_id_fk" FOREIGN KEY ("requisition_id") REFERENCES "public"."requisitions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "users" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number");
ALTER TABLE "users" ADD COLUMN "is_two_factor_enabled" text DEFAULT 'no';
CREATE TYPE "public"."agent_execution_status" AS ENUM('queued', 'running', 'success', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."agent_recommendation_status" AS ENUM('pending', 'approved', 'dismissed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."recommendation_impact" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "agent_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_name" text NOT NULL,
	"status" "agent_execution_status" DEFAULT 'queued',
	"input_context" text,
	"output_data" text,
	"confidence_score" integer,
	"token_usage" integer,
	"execution_time_ms" integer,
	"error_message" text,
	"triggered_by" text DEFAULT 'manual',
	"user_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "agent_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_name" text NOT NULL,
	"recommendation_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"impact" "recommendation_impact" DEFAULT 'medium',
	"estimated_savings" numeric(12, 2),
	"action_payload" text,
	"status" "agent_recommendation_status" DEFAULT 'pending',
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "demand_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"part_id" uuid NOT NULL,
	"forecast_date" timestamp NOT NULL,
	"predicted_quantity" integer NOT NULL,
	"confidence_lower" integer,
	"confidence_upper" integer,
	"trend" text DEFAULT 'stable',
	"seasonality_factor" numeric(5, 2),
	"factors" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"alert_type" text NOT NULL,
	"severity" text DEFAULT 'medium',
	"description" text NOT NULL,
	"indicators" text,
	"suggested_action" text,
	"false_positive_probability" numeric(5, 2),
	"status" text DEFAULT 'open',
	"resolved_by" uuid,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_price_index" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"part_category" text NOT NULL,
	"commodity" text,
	"benchmark_price" numeric(12, 4),
	"source" text,
	"valid_from" timestamp,
	"valid_to" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_optimizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"invoice_id" uuid,
	"supplier_name" text NOT NULL,
	"invoice_amount" numeric(12, 2) NOT NULL,
	"discount_terms" text,
	"current_due_date" timestamp,
	"suggested_payment_date" timestamp,
	"potential_savings" numeric(12, 2),
	"savings_type" text,
	"reason" text,
	"annualized_return" numeric(5, 2),
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_two_factor_enabled" SET DATA TYPE boolean;--> statement-breakpoint
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD CONSTRAINT "agent_recommendations_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_optimizations" ADD CONSTRAINT "payment_optimizations_order_id_procurement_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."procurement_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_optimizations" ADD CONSTRAINT "payment_optimizations_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_exec_name_idx" ON "agent_executions" USING btree ("agent_name");--> statement-breakpoint
CREATE INDEX "agent_exec_status_idx" ON "agent_executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "agent_exec_created_idx" ON "agent_executions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "agent_rec_name_idx" ON "agent_recommendations" USING btree ("agent_name");--> statement-breakpoint
CREATE INDEX "agent_rec_status_idx" ON "agent_recommendations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "agent_rec_impact_idx" ON "agent_recommendations" USING btree ("impact");--> statement-breakpoint
CREATE INDEX "forecast_part_idx" ON "demand_forecasts" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "forecast_date_idx" ON "demand_forecasts" USING btree ("forecast_date");--> statement-breakpoint
CREATE INDEX "fraud_entity_idx" ON "fraud_alerts" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "fraud_severity_idx" ON "fraud_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "fraud_status_idx" ON "fraud_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "price_idx_category" ON "market_price_index" USING btree ("part_category");--> statement-breakpoint
CREATE INDEX "pay_opt_order_idx" ON "payment_optimizations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "pay_opt_status_idx" ON "payment_optimizations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "receipt_order_idx" ON "goods_receipts" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "received_by_idx" ON "goods_receipts" USING btree ("received_by_id");--> statement-breakpoint
CREATE INDEX "invoice_order_idx" ON "invoices" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "invoice_supplier_idx" ON "invoices" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "item_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "item_part_idx" ON "order_items" USING btree ("part_id");--> statement-breakpoint
CREATE INDEX "order_supplier_idx" ON "procurement_orders" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "procurement_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_req_idx" ON "procurement_orders" USING btree ("requisition_id");--> statement-breakpoint
CREATE INDEX "order_created_at_idx" ON "procurement_orders" USING btree ("created_at");
CREATE TYPE "public"."action_plan_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."action_plan_status" AS ENUM('draft', 'active', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."approval_policy_type" AS ENUM('amount', 'category', 'supplier_risk', 'contract_coverage', 'combined');--> statement-breakpoint
CREATE TYPE "public"."compliance_status" AS ENUM('active', 'expiring_soon', 'expired', 'waived', 'not_applicable');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('active', 'inactive', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."import_job_status" AS ENUM('pending', 'validating', 'validated', 'importing', 'completed', 'failed', 'rolled_back');--> statement-breakpoint
CREATE TYPE "public"."invoice_override_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."invoice_override_type" AS ENUM('place_hold', 'clear_hold', 'payment_reversal');--> statement-breakpoint
CREATE TYPE "public"."savings_category" AS ENUM('negotiated', 'avoided', 'process', 'logistics', 'payment_term', 'should_cost', 'consolidation', 'volume_discount');--> statement-breakpoint
CREATE TYPE "public"."savings_tracking_status" AS ENUM('forecast', 'realized', 'validated', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."sourcing_event_status" AS ENUM('draft', 'launched', 'supplier_qa', 'bid_submitted', 'bid_locked', 'evaluation', 'negotiation', 'awarded', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."sourcing_message_type" AS ENUM('question', 'answer', 'clarification', 'general', 'system');--> statement-breakpoint
CREATE TYPE "public"."supplier_request_status" AS ENUM('draft', 'sent', 'acknowledged', 'in_progress', 'submitted', 'verified', 'rejected', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."supplier_request_type" AS ENUM('document_request', 'corrective_action', 'compliance_attestation', 'commercial_clarification', 'onboarding', 'periodic_review');--> statement-breakpoint
CREATE TYPE "public"."supplier_segment" AS ENUM('strategic', 'bottleneck', 'leverage', 'routine', 'high_risk');--> statement-breakpoint
CREATE TYPE "public"."support_ticket_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."support_ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."task_entity_type" AS ENUM('requisition', 'rfq', 'order', 'invoice', 'contract', 'supplier', 'compliance_obligation', 'agent_recommendation');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'in_progress', 'blocked', 'completed', 'cancelled', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."webhook_delivery_status" AS ENUM('pending', 'success', 'failed', 'retrying');--> statement-breakpoint
CREATE TYPE "public"."webhook_event" AS ENUM('order.created', 'order.updated', 'order.fulfilled', 'invoice.created', 'invoice.matched', 'invoice.disputed', 'rfq.created', 'rfq.closed', 'requisition.approved', 'requisition.rejected', 'contract.expiring', 'contract.expired', 'supplier.created', 'supplier.updated');--> statement-breakpoint
CREATE TABLE "approval_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"entity_type" text NOT NULL,
	"policy_type" "approval_policy_type" DEFAULT 'amount',
	"conditions" text NOT NULL,
	"approver_ids" text[],
	"approver_role" text,
	"escalation_timeout_hours" integer DEFAULT 48,
	"is_active" text DEFAULT 'yes',
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cost_center" text,
	"total_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"used_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"fiscal_year" text NOT NULL,
	"department" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_obligations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"supplier_id" uuid,
	"contract_id" uuid,
	"category" text NOT NULL,
	"status" "compliance_status" DEFAULT 'active',
	"owner_id" uuid,
	"document_required" text DEFAULT 'yes',
	"document_url" text,
	"evidence_submitted_at" timestamp,
	"expires_at" timestamp,
	"reminder_days_before" integer DEFAULT 30,
	"last_reminder_sent_at" timestamp,
	"escalation_policy" text,
	"policy_pack" text,
	"region" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"job_title" text,
	"region" text,
	"country" text,
	"continent" text,
	"currency" text DEFAULT 'INR',
	"status" "contact_status" DEFAULT 'active',
	"notes" text,
	"supplier_id" uuid,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cost_centers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"department" text,
	"is_active" text DEFAULT 'yes',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "cost_centers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "import_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"status" "import_job_status" DEFAULT 'pending',
	"file_name" text NOT NULL,
	"total_rows" integer DEFAULT 0,
	"success_rows" integer DEFAULT 0,
	"error_rows" integer DEFAULT 0,
	"validation_report" text,
	"field_mapping" text,
	"source_system_id" text,
	"rollback_data" text,
	"imported_by_id" uuid NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_override_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"request_type" "invoice_override_type" NOT NULL,
	"status" "invoice_override_status" DEFAULT 'pending' NOT NULL,
	"reason" text NOT NULL,
	"decision_notes" text,
	"requested_by_id" uuid NOT NULL,
	"approved_by_id" uuid,
	"requested_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "matching_tolerances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"supplier_id" uuid,
	"price_tolerance_percent" numeric(5, 2) DEFAULT '2.00',
	"quantity_tolerance_percent" numeric(5, 2) DEFAULT '5.00',
	"allow_partial_delivery" text DEFAULT 'yes',
	"exception_reasons" text,
	"is_active" text DEFAULT 'yes',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "savings_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"category" "savings_category" NOT NULL,
	"tracking_status" "savings_tracking_status" DEFAULT 'forecast',
	"forecast_amount" numeric(12, 2) NOT NULL,
	"realized_amount" numeric(12, 2),
	"baseline_amount" numeric(12, 2),
	"currency" text DEFAULT 'INR',
	"validated_by_id" uuid,
	"validated_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sourcing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"status" "sourcing_event_status" DEFAULT 'draft',
	"launched_at" timestamp,
	"bid_deadline" timestamp,
	"qa_deadline" timestamp,
	"evaluation_deadline" timestamp,
	"scoring_model" text,
	"award_memo" text,
	"awarded_supplier_id" uuid,
	"awarded_at" timestamp,
	"award_justification" text,
	"scenario_comparison" text,
	"no_bid_handling" text DEFAULT 'extend_deadline',
	"owner_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sourcing_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rfq_id" uuid NOT NULL,
	"supplier_id" uuid,
	"sender_id" uuid NOT NULL,
	"message_type" "sourcing_message_type" DEFAULT 'general',
	"subject" text,
	"content" text NOT NULL,
	"parent_message_id" uuid,
	"is_read" text DEFAULT 'no',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_action_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"severity" "action_plan_severity" DEFAULT 'medium',
	"status" "action_plan_status" DEFAULT 'draft',
	"plan_type" text NOT NULL,
	"owner_id" uuid,
	"due_date" timestamp,
	"steps" text,
	"linked_evidence" text,
	"completed_at" timestamp,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"request_type" "supplier_request_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "supplier_request_status" DEFAULT 'draft',
	"assignee_id" uuid,
	"due_date" timestamp,
	"response_text" text,
	"response_document_url" text,
	"responded_at" timestamp,
	"verified_by_id" uuid,
	"verified_at" timestamp,
	"linked_obligation_id" uuid,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" text NOT NULL,
	"submitted_by_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'general',
	"priority" "support_ticket_priority" DEFAULT 'medium',
	"status" "support_ticket_status" DEFAULT 'open',
	"resolution" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" uuid NOT NULL,
	"event" text NOT NULL,
	"payload" text NOT NULL,
	"status_code" integer,
	"response" text,
	"status" "webhook_delivery_status" DEFAULT 'pending',
	"attempts" integer DEFAULT 0,
	"next_retry_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"events" text[] NOT NULL,
	"secret" text NOT NULL,
	"is_active" text DEFAULT 'yes',
	"description" text,
	"created_by_id" uuid,
	"last_triggered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"entity_type" "task_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"status" "task_status" DEFAULT 'open',
	"priority" "task_priority" DEFAULT 'medium',
	"assignee_id" uuid,
	"created_by_id" uuid NOT NULL,
	"due_date" timestamp,
	"sla_deadline" timestamp,
	"escalated_at" timestamp,
	"escalated_to_id" uuid,
	"escalation_reason" text,
	"completed_at" timestamp,
	"completion_evidence" text,
	"next_action" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "order_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "confidence" integer;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "business_impact" text;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "explanation" text;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "execution_payload" text;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "executed_at" timestamp;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "dismissal_reason" text;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "outcome_tracking" text;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "entity_type" text;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "entity_id" uuid;--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "currency" text DEFAULT 'INR';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "continent" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_date" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "tax_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "subtotal" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "line_items" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_terms" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "purchase_order_ref" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "document_url" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "release_hold" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "release_hold_reason" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "release_hold_applied_at" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "reversed_at" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "reversal_reason" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "reversal_reference" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "reversed_by_id" uuid;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "parts" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "gemini_api_key" text;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "gemini_api_key_fallback_1" text;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "gemini_api_key_fallback_2" text;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "exchange_rates" text;--> statement-breakpoint
ALTER TABLE "requisitions" ADD COLUMN "budget_id" uuid;--> statement-breakpoint
ALTER TABLE "rfqs" ADD COLUMN "deadline" timestamp;--> statement-breakpoint
ALTER TABLE "rfqs" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "rfqs" ADD COLUMN "created_by_id" uuid;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "segment" "supplier_segment";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "access_profile" text DEFAULT 'internal_user' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country_scope" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "region_scope" text;--> statement-breakpoint
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_imported_by_id_users_id_fk" FOREIGN KEY ("imported_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_override_requests" ADD CONSTRAINT "invoice_override_requests_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_override_requests" ADD CONSTRAINT "invoice_override_requests_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_override_requests" ADD CONSTRAINT "invoice_override_requests_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matching_tolerances" ADD CONSTRAINT "matching_tolerances_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_records" ADD CONSTRAINT "savings_records_validated_by_id_users_id_fk" FOREIGN KEY ("validated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_events" ADD CONSTRAINT "sourcing_events_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_events" ADD CONSTRAINT "sourcing_events_awarded_supplier_id_suppliers_id_fk" FOREIGN KEY ("awarded_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_events" ADD CONSTRAINT "sourcing_events_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_messages" ADD CONSTRAINT "sourcing_messages_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_messages" ADD CONSTRAINT "sourcing_messages_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_messages" ADD CONSTRAINT "sourcing_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_action_plans" ADD CONSTRAINT "supplier_action_plans_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_action_plans" ADD CONSTRAINT "supplier_action_plans_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_action_plans" ADD CONSTRAINT "supplier_action_plans_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_requests" ADD CONSTRAINT "supplier_requests_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_requests" ADD CONSTRAINT "supplier_requests_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_requests" ADD CONSTRAINT "supplier_requests_verified_by_id_users_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_requests" ADD CONSTRAINT "supplier_requests_linked_obligation_id_compliance_obligations_id_fk" FOREIGN KEY ("linked_obligation_id") REFERENCES "public"."compliance_obligations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_requests" ADD CONSTRAINT "supplier_requests_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhook_id_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_escalated_to_id_users_id_fk" FOREIGN KEY ("escalated_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ap_entity_type_idx" ON "approval_policies" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "ap_active_idx" ON "approval_policies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "budget_dept_idx" ON "budgets" USING btree ("department");--> statement-breakpoint
CREATE INDEX "budget_year_idx" ON "budgets" USING btree ("fiscal_year");--> statement-breakpoint
CREATE INDEX "compliance_supplier_idx" ON "compliance_obligations" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "compliance_status_idx" ON "compliance_obligations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "compliance_expiry_idx" ON "compliance_obligations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "compliance_category_idx" ON "compliance_obligations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "contact_email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_supplier_idx" ON "contacts" USING btree ("supplier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cost_center_code_idx" ON "cost_centers" USING btree ("code");--> statement-breakpoint
CREATE INDEX "ij_status_idx" ON "import_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ij_entity_idx" ON "import_jobs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "ij_created_idx" ON "import_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "invoice_override_invoice_idx" ON "invoice_override_requests" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_override_status_idx" ON "invoice_override_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_override_requester_idx" ON "invoice_override_requests" USING btree ("requested_by_id");--> statement-breakpoint
CREATE INDEX "mt_category_idx" ON "matching_tolerances" USING btree ("category");--> statement-breakpoint
CREATE INDEX "mt_supplier_idx" ON "matching_tolerances" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "sav_entity_idx" ON "savings_records" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "sav_category_idx" ON "savings_records" USING btree ("category");--> statement-breakpoint
CREATE INDEX "sav_status_idx" ON "savings_records" USING btree ("tracking_status");--> statement-breakpoint
CREATE INDEX "se_rfq_idx" ON "sourcing_events" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "se_status_idx" ON "sourcing_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "se_deadline_idx" ON "sourcing_events" USING btree ("bid_deadline");--> statement-breakpoint
CREATE INDEX "sm_rfq_idx" ON "sourcing_messages" USING btree ("rfq_id");--> statement-breakpoint
CREATE INDEX "sm_supplier_idx" ON "sourcing_messages" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "sm_sender_idx" ON "sourcing_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "sm_parent_idx" ON "sourcing_messages" USING btree ("parent_message_id");--> statement-breakpoint
CREATE INDEX "ap_supplier_idx" ON "supplier_action_plans" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "ap_status_idx" ON "supplier_action_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ap_severity_idx" ON "supplier_action_plans" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "ap_due_idx" ON "supplier_action_plans" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "sr_supplier_idx" ON "supplier_requests" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "sr_status_idx" ON "supplier_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sr_type_idx" ON "supplier_requests" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "sr_due_idx" ON "supplier_requests" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "ticket_status_idx" ON "support_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ticket_priority_idx" ON "support_tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "ticket_user_idx" ON "support_tickets" USING btree ("submitted_by_id");--> statement-breakpoint
CREATE INDEX "delivery_webhook_idx" ON "webhook_deliveries" USING btree ("webhook_id");--> statement-breakpoint
CREATE INDEX "delivery_status_idx" ON "webhook_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "webhook_active_idx" ON "webhooks" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "task_entity_idx" ON "workflow_tasks" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "task_assignee_idx" ON "workflow_tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "workflow_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_due_idx" ON "workflow_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "task_priority_idx" ON "workflow_tasks" USING btree ("priority");--> statement-breakpoint
ALTER TABLE "agent_recommendations" ADD CONSTRAINT "agent_recommendations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_reversed_by_id_users_id_fk" FOREIGN KEY ("reversed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requisitions" ADD CONSTRAINT "requisitions_budget_id_budgets_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_rec_entity_idx" ON "agent_recommendations" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "agent_rec_owner_idx" ON "agent_recommendations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "invoice_hold_idx" ON "invoices" USING btree ("release_hold");--> statement-breakpoint
CREATE INDEX "invoice_reversed_idx" ON "invoices" USING btree ("reversed_at");--> statement-breakpoint
CREATE INDEX "part_country_idx" ON "parts" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "part_region_idx" ON "parts" USING btree ("region");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_access_profile_idx" ON "users" USING btree ("access_profile");--> statement-breakpoint
CREATE INDEX "user_country_scope_idx" ON "users" USING btree ("country_scope");

