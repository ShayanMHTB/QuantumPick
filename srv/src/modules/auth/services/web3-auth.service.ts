import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

import { PrismaService } from '../../../integrations/prisma/prisma.service';
import { AuthSource } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { AuthConfigService } from '../../../config/services/auth-config.service';

@Injectable()
export class Web3AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private authConfigService: AuthConfigService,
  ) {}

  async createSiweMessage(address: string, chainId: number) {
    // Generate a random nonce
    const nonce = crypto.randomBytes(16).toString('hex');

    // Generate a checksummed address
    const checksummedAddress = ethers.getAddress(address);

    // Get SIWE config
    const siweConfig = this.authConfigService.getSiweConfig();

    // Store nonce in database
    await this.prisma.siweNonce.create({
      data: {
        walletAddress: address.toLowerCase(),
        nonce,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
      },
    });

    // Create SIWE message with config
    const message = new SiweMessage({
      domain: siweConfig.domain,
      address: checksummedAddress,
      statement: siweConfig.statement,
      uri: siweConfig.origin,
      version: siweConfig.version,
      chainId: chainId || siweConfig.chainId,
      nonce,
    });

    return message.prepareMessage();
  }

  async verifySiweMessage(message: string, signature: string) {
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
      const storedNonce = await this.prisma.siweNonce.findFirst({
        where: {
          walletAddress: siweMessage.address.toLowerCase(),
          nonce: siweMessage.nonce,
          expiresAt: { gt: new Date() },
        },
      });

      if (!storedNonce) {
        throw new UnauthorizedException('Invalid or expired nonce');
      }

      // Delete the used nonce
      await this.prisma.siweNonce.delete({
        where: { id: storedNonce.id },
      });

      // Find or create user by wallet address
      let user = await this.usersService.findByWalletAddress(
        siweMessage.address,
      );

      if (!user) {
        // Create new user with this wallet
        user = await this.prisma.user.create({
          data: {
            authSource: AuthSource.WEB3,
            wallets: {
              create: {
                address: siweMessage.address.toLowerCase(),
                chainId: siweMessage.chainId,
                isPrimary: true,
              },
            },
            profile: {
              create: {
                displayName: `User-${siweMessage.address.substring(0, 6)}`,
              },
            },
          },
          include: {
            wallets: true,
            profile: true, // Make sure to include the profile in the result
          },
        });
      } else {
        // Check if wallet is already linked
        const existingWallet = await this.prisma.wallet.findFirst({
          where: {
            userId: user.id,
            address: siweMessage.address.toLowerCase(),
          },
        });

        if (!existingWallet) {
          // Add wallet to existing user if not already linked
          await this.prisma.wallet.create({
            data: {
              address: siweMessage.address.toLowerCase(),
              chainId: siweMessage.chainId,
              userId: user.id,
            },
          });
        }
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate JWT
      const payload = {
        sub: user.id,
        wallet: siweMessage.address,
        role: user.role,
      };

      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          wallet: siweMessage.address,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Verification failed: ' + error.message);
    }
  }
}
