/*
  Warnings:

  - You are about to alter the column `exchangeVat` on the `Bucket` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Bucket" ALTER COLUMN "exchangeVat" SET DATA TYPE INTEGER;
