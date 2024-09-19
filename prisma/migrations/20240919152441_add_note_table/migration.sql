/*
  Warnings:

  - You are about to drop the column `notes` on the `Verse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Verse" DROP COLUMN "notes";

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verseModelId" TEXT,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_verseModelId_key" ON "Note"("verseModelId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_verseModelId_fkey" FOREIGN KEY ("verseModelId") REFERENCES "Verse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
