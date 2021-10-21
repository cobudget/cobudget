-- DropForeignKey
ALTER TABLE "FieldValue" DROP CONSTRAINT "FieldValue_fieldId_fkey";

-- AlterTable
ALTER TABLE "FieldValue" ALTER COLUMN "fieldId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FieldValue" ADD CONSTRAINT "FieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE SET NULL ON UPDATE CASCADE;
