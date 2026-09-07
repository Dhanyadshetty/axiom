CREATE TABLE "assessment_request_supplier_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_request_supplier_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "arsc_unique" UNIQUE("assessment_request_supplier_id","contact_id")
);
--> statement-breakpoint
ALTER TABLE "assessment_request_supplier_contacts" ADD CONSTRAINT "assessment_request_supplier_contacts_assessment_request_supplier_id_assessment_request_suppliers_id_fk" FOREIGN KEY ("assessment_request_supplier_id") REFERENCES "public"."assessment_request_suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_request_supplier_contacts" ADD CONSTRAINT "assessment_request_supplier_contacts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "arsc_ars_idx" ON "assessment_request_supplier_contacts" USING btree ("assessment_request_supplier_id");--> statement-breakpoint
CREATE INDEX "arsc_contact_idx" ON "assessment_request_supplier_contacts" USING btree ("contact_id");