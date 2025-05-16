import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SiweMessage } from 'siwe';
import { PrismaService } from 'src/integrations/prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId },
      orderBy: {
        isPrimary: 'desc', // Primary wallets first
      },
    });
  }

  async findAllVerified(userId: string) {
    return this.prisma.wallet.findMany({
      where: {
        userId,
        isVerified: true,
      },
      orderBy: {
        isPrimary: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async findByAddress(address: string) {
    return this.prisma.wallet.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        user: true,
      },
    });
  }

  async generateVerificationMessage(address: string, chainId: number) {
    // Generate a random nonce
    const nonce = Math.floor(Math.random() * 100000000).toString();

    // Store nonce in database (temporary record)
    await this.prisma.walletVerificationNonce.create({
      data: {
        walletAddress: address.toLowerCase(),
        nonce,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
      },
    });

    // Create SIWE message
    const message = new SiweMessage({
      domain: process.env.SIWE_DOMAIN || 'quantumpick.io',
      address: address,
      statement: 'Verify wallet ownership for QuantumPick',
      uri: process.env.SIWE_ORIGIN || 'https://quantumpick.io',
      version: '1',
      chainId: chainId,
      nonce,
    });

    return message.prepareMessage();
  }

  async addWallet(
    userId: string,
    address: string,
    chainId: number,
    signature: string,
    message: string,
    nickname?: string,
  ) {
    // Check if wallet already exists for this user
    const existingWallet = await this.prisma.wallet.findFirst({
      where: {
        userId,
        address: address.toLowerCase(),
      },
    });

    if (existingWallet) {
      throw new ConflictException('Wallet already linked to this account');
    }

    // Check if wallet is owned by another user
    const existingWalletAny = await this.prisma.wallet.findFirst({
      where: {
        address: address.toLowerCase(),
      },
    });

    if (existingWalletAny) {
      throw new ConflictException('Wallet already linked to another account');
    }

    // Verify ownership via SIWE
    try {
      // Parse the SIWE message
      const siweMessage = new SiweMessage(message);

      // Verify the signature
      const { success } = await siweMessage.verify({
        signature: signature,
      });

      if (!success) {
        throw new UnauthorizedException('Invalid signature');
      }

      // Check if nonce exists and is valid
      const storedNonce = await this.prisma.walletVerificationNonce.findFirst({
        where: {
          walletAddress: siweMessage.address.toLowerCase(),
          nonce: siweMessage.nonce,
          expiresAt: { gt: new Date() },
        },
      });

      if (!storedNonce) {
        throw new UnauthorizedException('Invalid or expired nonce');
      }

      // Verify address matches
      if (siweMessage.address.toLowerCase() !== address.toLowerCase()) {
        throw new UnauthorizedException('Address mismatch in verification');
      }

      // Delete the used nonce
      await this.prisma.walletVerificationNonce.delete({
        where: { id: storedNonce.id },
      });
    } catch (error) {
      throw new UnauthorizedException(
        `Wallet verification failed: ${error.message}`,
      );
    }

    // Check if this is the first wallet for this user
    const walletCount = await this.prisma.wallet.count({
      where: { userId },
    });

    // Create the wallet
    return this.prisma.wallet.create({
      data: {
        userId,
        address: address.toLowerCase(),
        chainId,
        nickname,
        isPrimary: walletCount === 0, // First wallet is primary by default
        isVerified: true, // Verified through SIWE
        lastUsedAt: new Date(),
      },
    });
  }

  async setPrimary(id: string, userId: string) {
    // Check if wallet exists and belongs to user
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new NotFoundException('Wallet not found');
    }

    if (!wallet.isVerified) {
      throw new BadRequestException('Cannot set unverified wallet as primary');
    }

    // Start a transaction to update primary status
    return this.prisma.$transaction(async (tx) => {
      // Remove primary status from all other wallets
      await tx.wallet.updateMany({
        where: {
          userId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });

      // Set this wallet as primary
      return tx.wallet.update({
        where: { id },
        data: {
          isPrimary: true,
          lastUsedAt: new Date(),
        },
      });
    });
  }

  async remove(id: string, userId: string) {
    // Check if wallet exists and belongs to user
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new NotFoundException('Wallet not found');
    }

    // Check if it's the primary wallet and if user has other wallets
    if (wallet.isPrimary) {
      const walletCount = await this.prisma.wallet.count({
        where: { userId },
      });

      if (walletCount > 1) {
        throw new BadRequestException(
          'Cannot remove primary wallet. Set another wallet as primary first.',
        );
      }
    }

    return this.prisma.wallet.delete({
      where: { id },
    });
  }

  async getWalletForTicket(userId: string, lotteryId: string) {
    // Get the lottery to check which chain it's on
    const lottery = await this.prisma.lottery.findUnique({
      where: { id: lotteryId },
      select: {
        chainId: true,
        ticketPrice: true,
        ticketToken: true,
      },
    });

    if (!lottery) {
      throw new NotFoundException('Lottery not found');
    }

    // Find wallet that matches the lottery's chain
    const wallets = await this.prisma.wallet.findMany({
      where: {
        userId,
        chainId: lottery.chainId,
        isVerified: true,
      },
      orderBy: [{ isPrimary: 'desc' }, { lastUsedAt: 'desc' }],
      take: 1,
    });

    if (wallets.length === 0) {
      throw new BadRequestException(
        `No verified wallet found for chain ID ${lottery.chainId}`,
      );
    }

    return {
      wallet: wallets[0],
      lottery: {
        id: lotteryId,
        chainId: lottery.chainId,
        ticketPrice: lottery.ticketPrice,
        ticketToken: lottery.ticketToken,
      },
    };
  }

  async updateLastUsed(id: string, userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new NotFoundException('Wallet not found');
    }

    return this.prisma.wallet.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  // Add a method for easier testing with Ganache
  async addTestWallet(
    userId: string,
    address: string,
    chainId: number,
    nickname?: string,
  ) {
    // Check if wallet already exists for this user
    const existingWallet = await this.prisma.wallet.findFirst({
      where: {
        userId,
        address: address.toLowerCase(),
      },
    });

    if (existingWallet) {
      throw new ConflictException('Wallet already linked to this account');
    }

    // Check if wallet is owned by another user
    const existingWalletAny = await this.prisma.wallet.findFirst({
      where: {
        address: address.toLowerCase(),
      },
    });

    if (existingWalletAny) {
      throw new ConflictException('Wallet already linked to another account');
    }

    // Check if this is the first wallet for this user
    const walletCount = await this.prisma.wallet.count({
      where: { userId },
    });

    // Create the wallet with verification bypassed for testing
    return this.prisma.wallet.create({
      data: {
        userId,
        address: address.toLowerCase(),
        chainId,
        nickname: nickname || 'Test Wallet',
        isPrimary: walletCount === 0, // First wallet is primary by default
        isVerified: true, // Auto-verified for testing
        lastUsedAt: new Date(),
      },
    });
  }
}
