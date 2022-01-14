-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'HIDDEN');

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT E'PUBLIC';
