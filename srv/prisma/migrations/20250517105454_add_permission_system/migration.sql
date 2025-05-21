/*
  Warnings:

  - Changed the type of `permission` on the `UserPermission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PermissionName" AS ENUM ('CREATE_LOTTERY', 'EDIT_LOTTERY', 'VIEW_ADMIN_DASHBOARD', 'MODERATE_USERS', 'MANAGE_PLATFORM');

-- AlterTable
ALTER TABLE "UserPermission" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
DROP COLUMN "permission",
ADD COLUMN     "permission" "PermissionName" NOT NULL;

-- CreateTable
CREATE TABLE "UserMetrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticketsPurchased" INTEGER NOT NULL DEFAULT 0,
    "amountSpent" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMetrics_userId_key" ON "UserMetrics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_permission_key" ON "UserPermission"("userId", "permission");

-- AddForeignKey
ALTER TABLE "UserMetrics" ADD CONSTRAINT "UserMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
