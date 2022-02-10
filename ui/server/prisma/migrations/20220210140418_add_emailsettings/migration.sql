-- CreateTable
CREATE TABLE "EmailSettings" (
    "id" TEXT NOT NULL,
    "commentMentions" BOOLEAN NOT NULL DEFAULT true,
    "commentBecauseCocreator" BOOLEAN NOT NULL DEFAULT true,
    "commentBecauseCommented" BOOLEAN NOT NULL DEFAULT true,
    "allocatedToYou" BOOLEAN NOT NULL DEFAULT true,
    "refundedBecauseBucketCancelled" BOOLEAN NOT NULL DEFAULT true,
    "bucketPublishedInRound" BOOLEAN NOT NULL DEFAULT true,
    "contributionToYourBucket" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailSettings_userId_key" ON "EmailSettings"("userId");

-- AddForeignKey
ALTER TABLE "EmailSettings" ADD CONSTRAINT "EmailSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
