-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
