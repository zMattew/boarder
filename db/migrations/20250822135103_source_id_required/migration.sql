/*
  Warnings:

  - Made the column `sourceId` on table `Component` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Component" ALTER COLUMN "sourceId" SET NOT NULL;
