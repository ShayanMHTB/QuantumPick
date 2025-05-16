-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PURCHASED', 'WINNING', 'LOSING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('LOTTERY_CREATION_FEE', 'TICKET_PURCHASE', 'PRIZE_DISTRIBUTION', 'REFUND', 'PLATFORM_FEE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'PURCHASED';

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "blockNumber" INTEGER,
    "gasUsed" TEXT,
    "metadata" JSONB,
    "relatedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformEarning" (
    "id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "earningType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT NOT NULL,
    "lotteryId" TEXT,

    CONSTRAINT "PlatformEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionHash_key" ON "Transaction"("transactionHash");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_transactionHash_idx" ON "Transaction"("transactionHash");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformEarning_transactionId_key" ON "PlatformEarning"("transactionId");

-- CreateIndex
CREATE INDEX "PlatformEarning_earningType_idx" ON "PlatformEarning"("earningType");

-- CreateIndex
CREATE INDEX "PlatformEarning_lotteryId_idx" ON "PlatformEarning"("lotteryId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformEarning" ADD CONSTRAINT "PlatformEarning_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformEarning" ADD CONSTRAINT "PlatformEarning_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "Lottery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
