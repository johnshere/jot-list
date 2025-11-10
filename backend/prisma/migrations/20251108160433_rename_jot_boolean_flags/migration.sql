/*
  Warnings:

  - You are about to drop the column `completed` on the `Jot` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `Jot` table. All the data in the column will be lost.
  - You are about to drop the column `urgent` on the `Jot` table. All the data in the column will be lost.
  - You are about to alter the column `content` on the `Jot` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Jot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "tags" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" DATETIME NOT NULL,
    CONSTRAINT "Jot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Jot" (
    "id",
    "userId",
    "title",
    "content",
    "tags",
    "isImportant",
    "isUrgent",
    "startTime",
    "endTime",
    "startDate",
    "endDate",
    "isCompleted",
    "isDeleted",
    "createTime",
    "updateTime"
) SELECT
    "id",
    "userId",
    "title",
    "content",
    "tags",
    COALESCE("important", false),
    COALESCE("urgent", false),
    "startTime",
    "endTime",
    "startDate",
    "endDate",
    COALESCE("completed", false),
    COALESCE("deleted", false),
    "createTime",
    "updateTime"
FROM "Jot";
DROP TABLE "Jot";
ALTER TABLE "new_Jot" RENAME TO "Jot";
CREATE INDEX "Jot_userId_idx" ON "Jot"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
