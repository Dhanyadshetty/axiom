-- Add profile fields to contacts for the Add suppliers (Excel/manual) import flow
ALTER TABLE "contacts" ADD COLUMN "language" text;
ALTER TABLE "contacts" ADD COLUMN "department" text;
ALTER TABLE "contacts" ADD COLUMN "position" text;
ALTER TABLE "contacts" ADD COLUMN "responsibility" text;
