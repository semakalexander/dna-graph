-- CreateTable
CREATE TABLE "DnaMatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "contactUrl" TEXT NOT NULL,
    "managedByName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "possibleRelationships" TEXT NOT NULL,
    "totalCmShared" INTEGER NOT NULL,
    "percentDnaShared" INTEGER NOT NULL,
    "sharedSegments" INTEGER NOT NULL,
    "largestSegmentCm" INTEGER NOT NULL,
    "hasFamilyTree" BOOLEAN NOT NULL,
    "individualsInTree" INTEGER NOT NULL,
    "treeManagedBy" TEXT NOT NULL,
    "treeUrl" TEXT NOT NULL,
    "sharedAncestralSurnames" TEXT NOT NULL,
    "allAncestralSurnames" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "DnaMatch_matchID_idx" ON "DnaMatch"("matchID");
