ALTER TABLE "assessment_request_supplier_contacts" DROP CONSTRAINT IF EXISTS "assessment_request_supplier_contacts_contact_id_contacts_id_fk";--> statement-breakpoint
ALTER TABLE "assessment_request_supplier_contacts" ADD CONSTRAINT "assessment_request_supplier_contacts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_request_suppliers" DROP CONSTRAINT IF EXISTS "assessment_request_suppliers_contact_id_contacts_id_fk";--> statement-breakpoint
ALTER TABLE "assessment_request_suppliers" ADD CONSTRAINT "assessment_request_suppliers_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" DROP CONSTRAINT IF EXISTS "assessment_responses_contact_id_contacts_id_fk";--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE set null ON UPDATE no action;
