-- CreateEnum
CREATE TYPE "DirectFundingType" AS ENUM ('DONATION', 'EXCHANGE');

-- AlterTable
ALTER TABLE "Bucket" ADD COLUMN     "directFundingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "directFundingType" "DirectFundingType" NOT NULL DEFAULT E'DONATION',
ADD COLUMN     "exchangeDescription" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "exchangeMinimumContribution" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exchangeVat" DECIMAL(65,30);
