/*
  Warnings:

  - You are about to alter the column `percentDnaShared` on the `DnaMatch` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DnaMatch" (
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
    "percentDnaShared" REAL NOT NULL,
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
INSERT INTO "new_DnaMatch" ("age", "allAncestralSurnames", "contactUrl", "country", "createdAt", "hasFamilyTree", "id", "individualsInTree", "largestSegmentCm", "managedByName", "matchID", "name", "percentDnaShared", "possibleRelationships", "sharedAncestralSurnames", "sharedSegments", "status", "totalCmShared", "treeManagedBy", "treeUrl", "updatedAt") SELECT "age", "allAncestralSurnames", "contactUrl", "country", "createdAt", "hasFamilyTree", "id", "individualsInTree", "largestSegmentCm", "managedByName", "matchID", "name", "percentDnaShared", "possibleRelationships", "sharedAncestralSurnames", "sharedSegments", "status", "totalCmShared", "treeManagedBy", "treeUrl", "updatedAt" FROM "DnaMatch";
DROP TABLE "DnaMatch";
ALTER TABLE "new_DnaMatch" RENAME TO "DnaMatch";
CREATE INDEX "DnaMatch_matchID_idx" ON "DnaMatch"("matchID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
