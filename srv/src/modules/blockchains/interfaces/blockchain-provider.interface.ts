export interface IBlockchainProvider {
  // Deploy lottery method with all required parameters
  deployLottery(
    chainId: number,
    tokenAddress: string,
    ticketPrice: string,
    maxTickets: number | null,
    minTickets: number | null,
    startTime: Date | null,
    endTime: Date | null,
    drawTime: Date | null,
    prizeDistribution: any,
    creatorWalletAddress: string,
    privateKey: string,
  ): Promise<{ contractAddress: string; transactionHash: string }>;

  // Buy tickets method
  buyTickets(
    lotteryAddress: string,
    chainId: number,
    quantity: number,
    userWalletAddress: string,
    privateKey: string,
  ): Promise<{ transactionHash: string }>;

  // Check if user can buy tickets
  canBuyTickets(
    lotteryAddress: string,
    chainId: number,
    userAddress: string,
    quantity: number,
  ): Promise<{ canBuy: boolean; reason?: string }>;

  // Get lottery details
  getLotteryDetails(lotteryAddress: string, chainId: number): Promise<any>;

  // Get provider for a chain
  getProvider(chainId: number): any;
}
