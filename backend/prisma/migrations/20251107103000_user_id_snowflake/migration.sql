-- 将 User.id 从 INTEGER 自增调整为 TEXT，以便使用雪花算法生成的字符串 ID
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
    "isDeleted" INTEGER NOT NULL DEFAULT 0,
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
    CAST("id" AS TEXT),
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
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

PRAGMA foreign_keys=ON;

