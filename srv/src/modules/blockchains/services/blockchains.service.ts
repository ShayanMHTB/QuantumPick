import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as LotteryFactoryABI from '../abis/LotteryFactory.json';
import * as LotteryABI from '../abis/Lottery.json';
import { IBlockchainProvider } from '../interfaces/blockchain-provider.interface';

@Injectable()
export class BlockchainsService implements IBlockchainProvider {
  private readonly logger = new Logger(BlockchainsService.name);
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private factoryContracts: Map<number, ethers.Contract> = new Map();

  // Cache for lottery contracts
  private lotteryContracts: Map<string, ethers.Contract> = new Map();

  constructor(private configService: ConfigService) {
    // Initialize providers and contracts for supported networks
    this.initializeProviders();
  }

  private initializeProviders() {
    // Hardhat local node
    const hardhatRpc = `http://${process.env.HARDHAT_HOST || 'hardhat'}:${process.env.HARDHAT_PORT || '8545'}`;
    const hardhatChainId = 1337; // Hardhat's default chainId

    if (hardhatRpc) {
      try {
        // For Hardhat, create a StaticJsonRpcProvider to avoid ENS issues
        const provider = new ethers.JsonRpcProvider(hardhatRpc, {
          chainId: hardhatChainId,
          name: 'hardhat',
          ensAddress: undefined, // Explicitly disable ENS
        });

        this.providers.set(hardhatChainId, provider);

        // Use the deployed contract address from environment variable
        const factoryAddress = process.env.LOTTERY_FACTORY_ADDRESS;

        if (factoryAddress) {
          this.logger.log(
            `Initialized provider for chain ${hardhatChainId} (Hardhat)`,
          );
          this.logger.log(`Using LotteryFactory at ${factoryAddress}`);

          this.factoryContracts.set(
            hardhatChainId,
            new ethers.Contract(factoryAddress, LotteryFactoryABI, provider),
          );
        } else {
          this.logger.warn(
            'LotteryFactory address not set in environment variables',
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to initialize Hardhat provider: ${error.message}`,
        );
      }
    }

    // Ethereum Mainnet
    const mainnetRpc = this.configService.get<string>('ETHEREUM_RPC_URL');
    if (mainnetRpc) {
      const provider = new ethers.JsonRpcProvider(mainnetRpc);
      this.providers.set(1, provider);

      const factoryAddress = this.configService.get<string>(
        'LOTTERY_FACTORY_ADDRESS_MAINNET',
      );
      if (factoryAddress) {
        this.factoryContracts.set(
          1,
          new ethers.Contract(factoryAddress, LotteryFactoryABI, provider),
        );
      }
    }

    // Add other networks as needed (e.g., testnets, L2s)
  }

  async deployLottery(
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
  ) {
    try {
      const provider = this.providers.get(chainId);
      const factoryContract = this.factoryContracts.get(chainId);

      if (!provider || !factoryContract) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      // Create a wallet instance with the private key
      const wallet = new ethers.Wallet(privateKey, provider);
      const connectedFactory = factoryContract.connect(wallet);

      // Convert dates to Unix timestamps (seconds)
      const startTimeUnix = startTime
        ? Math.floor(startTime.getTime() / 1000)
        : 0;
      const endTimeUnix = endTime ? Math.floor(endTime.getTime() / 1000) : 0;
      const drawTimeUnix = drawTime ? Math.floor(drawTime.getTime() / 1000) : 0;

      // Extract prize distribution percentages
      const prizePercentages = [
        prizeDistribution.first || 100,
        prizeDistribution.second || 0,
        prizeDistribution.third || 0,
      ];

      // Deploy the lottery contract - use a more generic approach to avoid TypeScript issues
      // TypeScript doesn't know about the function names in the ABI
      const tx = await (connectedFactory as any).createLottery(
        tokenAddress,
        ethers.parseUnits(ticketPrice.toString(), 6), // Assuming 6 decimals for USDC
        maxTickets || 0,
        minTickets || 0,
        startTimeUnix,
        endTimeUnix,
        drawTimeUnix,
        prizePercentages,
        { gasLimit: 3000000n },
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Extract the deployed contract address from the event logs
      // This requires a different approach in ethers v6
      const contractAddress = this.extractContractAddressFromReceipt(
        receipt,
        factoryContract,
      );

      if (!contractAddress) {
        throw new Error('Failed to extract contract address from transaction');
      }

      this.logger.log(
        `Lottery deployed at ${contractAddress} on chain ${chainId}`,
      );

      return {
        contractAddress,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      this.logger.error(`Failed to deploy lottery: ${error.message}`);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  private extractContractAddressFromReceipt(
    receipt: ethers.TransactionReceipt,
    factoryContract: ethers.Contract,
  ): string | null {
    try {
      // Look through logs for the LotteryCreated event
      for (const log of receipt.logs) {
        try {
          // Try parsing each log with the contract's interface
          const parsed = factoryContract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          // If we found the LotteryCreated event and it has the right arguments
          if (
            parsed &&
            parsed.name === 'LotteryCreated' &&
            parsed.args.length >= 2
          ) {
            // The second argument should be the lottery address
            return parsed.args[1].toString();
          }
        } catch (error) {
          // Skip logs that can't be parsed as contract events
          console.log(error);
          continue;
        }
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to extract contract address: ${error.message}`);
      return null;
    }
  }

  /**
   * Get provider for a specific chain
   */
  getProvider(chainId: number): ethers.JsonRpcProvider | undefined {
    return this.providers.get(chainId);
  }

  /**
   * Get lottery contract instance
   */
  getLotteryContract(
    contractAddress: string,
    chainId: number,
    signerOrProvider?: ethers.Signer | ethers.Provider,
  ): ethers.Contract {
    const cacheKey = `${contractAddress}-${chainId}`;

    // Return cached contract if it exists and no signer is provided (read-only)
    if (this.lotteryContracts.has(cacheKey) && !signerOrProvider) {
      return this.lotteryContracts.get(cacheKey);
    }

    // Get provider if not explicitly provided
    if (!signerOrProvider) {
      signerOrProvider = this.providers.get(chainId);

      if (!signerOrProvider) {
        throw new Error(`No provider available for chain ID ${chainId}`);
      }
    }

    // Create new contract instance
    const contract = new ethers.Contract(
      contractAddress,
      LotteryABI,
      signerOrProvider,
    );

    // Cache the contract if using provider (read-only)
    if (
      !(signerOrProvider instanceof ethers.Wallet) &&
      !(signerOrProvider instanceof ethers.AbstractSigner)
    ) {
      this.lotteryContracts.set(cacheKey, contract);
    }

    return contract;
  }

  /**
   * Buy lottery tickets
   */
  async buyTickets(
    lotteryAddress: string,
    chainId: number,
    quantity: number,
    userWalletAddress: string,
    privateKey: string,
  ): Promise<{ transactionHash: string }> {
    try {
      const provider = this.providers.get(chainId);

      if (!provider) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      // Create wallet with private key
      const wallet = new ethers.Wallet(privateKey, provider);

      // Ensure the wallet matches the user's address
      if (wallet.address.toLowerCase() !== userWalletAddress.toLowerCase()) {
        throw new Error('Wallet address mismatch');
      }

      // Get lottery contract
      const lotteryContract = this.getLotteryContract(
        lotteryAddress,
        chainId,
        wallet,
      );

      // Call buyTickets function
      const tx = await lotteryContract.buyTickets(quantity, {
        gasLimit: 500000n, // Adjust as needed
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      return {
        transactionHash: receipt.hash,
      };
    } catch (error) {
      this.logger.error(`Failed to buy tickets: ${error.message}`);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  /**
   * Get lottery details from the contract
   */
  async getLotteryDetails(
    lotteryAddress: string,
    chainId: number,
  ): Promise<any> {
    try {
      const lotteryContract = this.getLotteryContract(lotteryAddress, chainId);

      // Call getDetails function
      const details = await lotteryContract.getDetails();

      // Format the response
      return {
        tokenAddress: details[0],
        ticketPrice: details[1].toString(),
        maxTickets: details[2].toString(),
        minTickets: details[3].toString(),
        startTime: new Date(Number(details[4]) * 1000),
        endTime: new Date(Number(details[5]) * 1000),
        drawTime: new Date(Number(details[6]) * 1000),
        totalTickets: details[7].toString(),
        status: details[8],
      };
    } catch (error) {
      this.logger.error(`Failed to get lottery details: ${error.message}`);
      throw new Error(`Blockchain error: ${error.message}`);
    }
  }

  /**
   * Check if a user can buy tickets (has sufficient token balance and allowance)
   */
  async canBuyTickets(
    lotteryAddress: string,
    chainId: number,
    userAddress: string,
    quantity: number,
  ): Promise<{ canBuy: boolean; reason?: string }> {
    try {
      // Get lottery details to check token and price
      const details = await this.getLotteryDetails(lotteryAddress, chainId);

      // Get token contract (standard ERC20 interface)
      const provider = this.providers.get(chainId);
      const tokenContract = new ethers.Contract(
        details.tokenAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function allowance(address owner, address spender) view returns (uint256)',
        ],
        provider,
      );

      // Check user's balance
      const balance = await tokenContract.balanceOf(userAddress);
      const requiredAmount = BigInt(details.ticketPrice) * BigInt(quantity);

      if (balance < requiredAmount) {
        return {
          canBuy: false,
          reason: 'Insufficient token balance',
        };
      }

      // Check allowance
      const allowance = await tokenContract.allowance(
        userAddress,
        lotteryAddress,
      );

      if (allowance < requiredAmount) {
        return {
          canBuy: false,
          reason: 'Insufficient token allowance',
        };
      }

      return { canBuy: true };
    } catch (error) {
      this.logger.error(
        `Failed to check if user can buy tickets: ${error.message}`,
      );
      return {
        canBuy: false,
        reason: `Error checking ticket purchase eligibility: ${error.message}`,
      };
    }
  }
}
