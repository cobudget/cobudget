-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "position" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "instance_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "landing_group_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instance_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instance_settings_landing_group_id_key" ON "instance_settings"("landing_group_id");

-- AddForeignKey
ALTER TABLE "instance_settings" ADD CONSTRAINT "instance_settings_landing_group_id_fkey" FOREIGN KEY ("landing_group_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
