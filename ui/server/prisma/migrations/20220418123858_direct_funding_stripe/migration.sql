-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "directFundingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "directFundingTerms" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "stripeAccountId" TEXT;
