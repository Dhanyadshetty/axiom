CREATE TYPE "contact_source" AS ENUM('manual', 'import');--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "responsibilities" text[];--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "source" "contact_source" DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
CREATE INDEX "contact_status_idx" ON "contacts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_supplier_email_idx" ON "contacts" USING btree ("supplier_id","email");
