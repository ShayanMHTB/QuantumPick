import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, EventFragment } from 'ethers';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { RabbitMQService } from 'src/integrations/rabbitmq/rabbitmq.service';
import * as LotteryABI from '../abis/Lottery.json';
import { LotteryStatus } from 'src/modules/lotteries/entities/lottery.entity';

@Injectable()
export class BlockchainEventListener implements OnModuleInit {
  private readonly logger = new Logger(BlockchainEventListener.name);
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private activeLotteryListeners: Map<string, any> = new Map();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private rabbitMQService: RabbitMQService,
  ) {}

  async onModuleInit() {
    // Initialize providers
    this.initializeProviders();

    // Start listening to existing active lotteries
    await this.startListeningToActiveLotteries();
  }

  private initializeProviders() {
    // Hardhat local node
    let hardhatRpc: string;

    // When running in a Docker environment, use the container name
    if (process.env.DOCKER_ENV === 'true') {
      hardhatRpc = 'http://hardhat:8545'; // Container hostname in Docker network
    } else {
      // When running locally, use localhost with the port from environment or default
      const port = process.env.HOST_HARDHAT_PORT || '8545';
      hardhatRpc = `http://localhost:${port}`;
    }

    this.logger.log(`Connecting to Hardhat RPC at ${hardhatRpc}`);

    const hardhatChainId = 1337; // Hardhat's default chainId

    if (hardhatRpc) {
      try {
        const provider = new ethers.JsonRpcProvider(hardhatRpc);
        this.providers.set(hardhatChainId, provider);
        this.logger.log(
          `Initialized event listener for chain ${hardhatChainId} (Hardhat)`,
        );
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
      this.logger.log('Initialized event listener for chain 1 (Ethereum)');
    }

    // Add other networks as needed
  }

  async startListeningToActiveLotteries() {
    try {
      // Find all active lotteries with contract addresses
      const activeLotteries = await this.prisma.lottery.findMany({
        where: {
          status: LotteryStatus.ACTIVE,
          contractAddress: { not: null },
        },
      });

      this.logger.log(
        `Found ${activeLotteries.length} active lotteries to monitor`,
      );

      // Start listening to each lottery's events
      for (const lottery of activeLotteries) {
        await this.listenToLotteryEvents(
          lottery.id,
          lottery.chainId,
          lottery.contractAddress,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to start listening to active lotteries: ${error.message}`,
      );
    }
  }

  async listenToLotteryEvents(
    lotteryId: string,
    chainId: number,
    contractAddress: string,
  ) {
    try {
      const provider = this.providers.get(chainId);

      if (!provider) {
        throw new Error(`No provider available for chain ID ${chainId}`);
      }

      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        LotteryABI,
        provider,
      );

      // Log available events in the contract ABI for debugging
      const eventFragments = contract.interface.fragments
        .filter((fragment) => fragment.type === 'event')
        .map((fragment) => fragment as EventFragment);

      const eventNames = eventFragments.map((fragment) => fragment.name);
      this.logger.log(`Available events in contract: ${eventNames.join(', ')}`);

      // Use a catch-all event listener instead of specific event names
      // This is more robust as it works regardless of event naming
      contract.on('*', async (event) => {
        const eventName = event.eventName || 'UnknownEvent';
        this.logger.log(
          `Event received from lottery ${lotteryId}: ${eventName}`,
        );

        // Handle different event types based on their name
        if (eventName.includes('Ticket') && eventName.includes('Purchase')) {
          // This will catch events like 'TicketPurchased', 'PurchaseTicket', etc.
          try {
            // Extract arguments (the order may vary based on your contract)
            const args = event.args || [];
            // Typically the first arg is buyer address, then ticket ID, then quantity
            // But we should handle cases where the order might be different
            let buyer, ticketId, quantity;

            // Simple heuristic - first argument that looks like an address is the buyer
            for (let i = 0; i < args.length; i++) {
              const arg = args[i];
              if (
                typeof arg === 'string' &&
                arg.startsWith('0x') &&
                arg.length === 42
              ) {
                buyer = arg;
                // Next argument after buyer is likely the ticket ID
                ticketId = args[i + 1] ? args[i + 1].toString() : '0';
                // And the one after that is likely the quantity
                quantity = args[i + 2] ? args[i + 2].toString() : '1';
                break;
              }
            }

            this.logger.log(
              `Ticket purchase detected for lottery ${lotteryId}: ${buyer} bought ${quantity} tickets`,
            );

            // Publish event to RabbitMQ
            await this.rabbitMQService.publish('lottery.ticket.purchased', {
              lotteryId,
              buyer,
              ticketId: ticketId || '0',
              quantity: quantity || '1',
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            this.logger.error(
              `Failed to process ticket purchase event: ${error.message}`,
            );
          }
        } else if (
          eventName.includes('Draw') &&
          (eventName.includes('Complete') || eventName.includes('Finish'))
        ) {
          // This will catch events like 'DrawCompleted', 'DrawFinished', etc.
          try {
            // Extract winning numbers from args
            const args = event.args || [];
            let winningNumbers = [];

            // Look for an array in the args which might be winning numbers
            for (let i = 0; i < args.length; i++) {
              const arg = args[i];
              if (Array.isArray(arg)) {
                winningNumbers = arg.map((n) => n.toString());
                break;
              }
            }

            this.logger.log(
              `Draw completed for lottery ${lotteryId}: winning numbers ${winningNumbers.join(', ')}`,
            );

            // Update lottery status
            await this.prisma.lottery.update({
              where: { id: lotteryId },
              data: {
                status: LotteryStatus.COMPLETED,
                drawTxHash: event.transactionHash,
              },
            });

            // Publish event to RabbitMQ
            await this.rabbitMQService.publish('lottery.draw.completed', {
              lotteryId,
              winningNumbers,
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            this.logger.error(
              `Failed to process draw completed event: ${error.message}`,
            );
          }
        }
      });

      // Store the listener reference so we can remove it later if needed
      this.activeLotteryListeners.set(lotteryId, {
        contract,
        listeners: ['*'], // We're using a catch-all listener
      });

      this.logger.log(
        `Started listening to events for lottery ${lotteryId} at ${contractAddress}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to listen to lottery events for ${lotteryId}: ${error.message}`,
      );
    }
  }

  async stopListeningToLottery(lotteryId: string) {
    const listener = this.activeLotteryListeners.get(lotteryId);

    if (listener) {
      try {
        // Remove all event listeners - with catch-all we just need to remove all listeners
        listener.contract.removeAllListeners();

        this.activeLotteryListeners.delete(lotteryId);
        this.logger.log(`Stopped listening to events for lottery ${lotteryId}`);
      } catch (error) {
        this.logger.error(
          `Error stopping lottery listener for ${lotteryId}: ${error.message}`,
        );
      }
    }
  }

  // Method to add a new lottery to listen to
  async addLotteryToListener(lotteryId: string) {
    try {
      const lottery = await this.prisma.lottery.findUnique({
        where: { id: lotteryId },
      });

      if (lottery && lottery.contractAddress) {
        await this.listenToLotteryEvents(
          lottery.id,
          lottery.chainId,
          lottery.contractAddress,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to add lottery ${lotteryId} to listeners: ${error.message}`,
      );
    }
  }
}
