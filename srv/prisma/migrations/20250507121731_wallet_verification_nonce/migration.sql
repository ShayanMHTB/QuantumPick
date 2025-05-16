-- CreateTable
CREATE TABLE "WalletVerificationNonce" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletVerificationNonce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WalletVerificationNonce_walletAddress_idx" ON "WalletVerificationNonce"("walletAddress");

-- CreateIndex
CREATE INDEX "WalletVerificationNonce_expiresAt_idx" ON "WalletVerificationNonce"("expiresAt");
