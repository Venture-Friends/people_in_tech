-- AlterTable: add columns missing from initial migration (which was SQLite-based and never ran on PostgreSQL)
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "careersUrl" TEXT;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "contactInfo" JSONB;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "vcFunded" BOOLEAN NOT NULL DEFAULT false;
