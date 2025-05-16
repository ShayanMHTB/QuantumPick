-- CreateEnum
CREATE TYPE "LotteryStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'DRAWING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LotteryType" AS ENUM ('STANDARD', 'PROGRESSIVE', 'FIXED_PRIZE');

-- CreateTable
CREATE TABLE "Lottery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "LotteryType" NOT NULL DEFAULT 'STANDARD',
    "status" "LotteryStatus" NOT NULL DEFAULT 'DRAFT',
    "chainId" INTEGER NOT NULL,
    "contractAddress" TEXT,
    "tokenAddress" TEXT NOT NULL,
    "ticketPrice" DECIMAL(18,2) NOT NULL,
    "maxTickets" INTEGER,
    "minTickets" INTEGER,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "drawTime" TIMESTAMP(3),
    "drawTxHash" TEXT,
    "prizeDistribution" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Lottery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketNumber" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txHash" TEXT,
    "lotteryId" TEXT NOT NULL,
    "purchaserId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotteryWinner" (
    "id" TEXT NOT NULL,
    "prizeRank" INTEGER NOT NULL,
    "prizeAmount" DECIMAL(18,2) NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimTxHash" TEXT,
    "claimedAt" TIMESTAMP(3),
    "lotteryId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,

    CONSTRAINT "LotteryWinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lottery_status_idx" ON "Lottery"("status");

-- CreateIndex
CREATE INDEX "Lottery_creatorId_idx" ON "Lottery"("creatorId");

-- CreateIndex
CREATE INDEX "Lottery_chainId_idx" ON "Lottery"("chainId");

-- CreateIndex
CREATE INDEX "Ticket_purchaserId_idx" ON "Ticket"("purchaserId");

-- CreateIndex
CREATE INDEX "Ticket_lotteryId_idx" ON "Ticket"("lotteryId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_lotteryId_ticketNumber_key" ON "Ticket"("lotteryId", "ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LotteryWinner_ticketId_key" ON "LotteryWinner"("ticketId");

-- CreateIndex
CREATE INDEX "LotteryWinner_lotteryId_idx" ON "LotteryWinner"("lotteryId");

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "Lottery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_purchaserId_fkey" FOREIGN KEY ("purchaserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryWinner" ADD CONSTRAINT "LotteryWinner_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "Lottery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryWinner" ADD CONSTRAINT "LotteryWinner_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
