-- CreateTable
CREATE TABLE "Verse" (
    "id" TEXT NOT NULL,
    "verseId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "isBookmarked" BOOLEAN,
    "highlightColor" TEXT,
    "notes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Verse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Verse_verseId_key" ON "Verse"("verseId");

-- CreateIndex
CREATE UNIQUE INDEX "Verse_userId_key" ON "Verse"("userId");

-- AddForeignKey
ALTER TABLE "Verse" ADD CONSTRAINT "Verse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
