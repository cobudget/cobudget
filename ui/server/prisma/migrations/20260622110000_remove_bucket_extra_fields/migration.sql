-- AlterTable
ALTER TABLE "Bucket"
  DROP COLUMN IF EXISTS "priorityArea",
  DROP COLUMN IF EXISTS "sourceFunding",
  DROP COLUMN IF EXISTS "keyFundCommentary";
