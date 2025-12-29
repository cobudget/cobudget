-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "redirectDomain" TEXT;
