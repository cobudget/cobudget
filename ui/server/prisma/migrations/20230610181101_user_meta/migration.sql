-- CreateTable
CREATE TABLE "UserMeta" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastMagicLinkDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMeta_userId_key" ON "UserMeta"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMeta_email_key" ON "UserMeta"("email");
