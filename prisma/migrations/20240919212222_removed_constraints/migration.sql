/*
  Warnings:

  - You are about to drop the column `userId` on the `Note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropIndex
DROP INDEX "Note_userId_key";

-- DropIndex
DROP INDEX "Note_verseModelId_key";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "userId";
