-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "length" INTEGER,
    "color" TEXT
);

-- CreateTable
CREATE TABLE "Link" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    CONSTRAINT "Link_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Link_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_id_key" ON "Node"("id");
