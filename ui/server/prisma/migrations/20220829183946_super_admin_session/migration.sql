-- CreateTable
CREATE TABLE "SuperAdminSession" (
    "id" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "SuperAdminSession_pkey" PRIMARY KEY ("id")
);
