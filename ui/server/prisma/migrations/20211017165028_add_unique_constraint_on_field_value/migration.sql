/*
  Warnings:

  - A unique constraint covering the columns `[bucketId,fieldId]` on the table `FieldValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FieldValue_bucketId_fieldId_key" ON "FieldValue"("bucketId", "fieldId");
