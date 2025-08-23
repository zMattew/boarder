/*
  Warnings:

  - You are about to drop the column `sourceName` on the `Component` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Component" DROP CONSTRAINT "Component_sourceName_fkey";

-- DropIndex
DROP INDEX "public"."Source_name_key";

-- AlterTable
ALTER TABLE "public"."Component" DROP COLUMN "sourceName",
ADD COLUMN     "sourceId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Component" ADD CONSTRAINT "Component_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
