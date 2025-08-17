/*
  Warnings:

  - You are about to drop the column `prompt` on the `Component` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Component" DROP COLUMN "prompt",
ADD COLUMN     "threadId" TEXT;
