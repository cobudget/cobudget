-- AlterTable
ALTER TABLE "OrgMember" ADD COLUMN     "hasJoined" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true;
