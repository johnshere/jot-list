PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "wechat" TEXT,
    "qq" TEXT,
    "avatar" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" DATETIME,
    "createTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" DATETIME NOT NULL
);

INSERT INTO "new_User" (
    "id",
    "userName",
    "phone",
    "password",
    "email",
    "wechat",
    "qq",
    "avatar",
    "status",
    "isDeleted",
    "lastLoginAt",
    "createTime",
    "updateTime"
)
SELECT
    "id",
    "userName",
    "phone",
    "password",
    "email",
    "wechat",
    "qq",
    "avatar",
    "status",
    CASE
        WHEN "isDeleted" IN (1, '1', 'true', 'TRUE') THEN true
        ELSE false
    END,
    "lastLoginAt",
    "createTime",
    "updateTime"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

CREATE TABLE "Jot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "important" BOOLEAN NOT NULL DEFAULT false,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" DATETIME NOT NULL,
    CONSTRAINT "Jot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Jot_userId_idx" ON "Jot"("userId");

PRAGMA foreign_keys=ON;

