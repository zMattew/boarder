-- AlterTable
ALTER TABLE "public"."Component" ADD COLUMN     "history" JSONB[] DEFAULT ARRAY[]::JSONB[];
