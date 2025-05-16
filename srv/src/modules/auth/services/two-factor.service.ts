import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { CoreAuthService } from '../services/core-auth.service';

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private authService: CoreAuthService,
  ) {}

  /**
   * Enable 2FA for a user
   * @param userId The user ID
   * @returns Secret and QR code
   */
  async enable2FA(userId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled',
      );
    }

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `QuantumPick:${user.email || userId}`,
    });

    // Store the secret temporarily (will be confirmed during verification)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    // Generate a QR code with better styling options
    const qrCode = await QRCode.toDataURL(secret.otpauth_url, {
      errorCorrectionLevel: 'H', // High error correction capability
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000', // Black dots
        light: '#FFF', // White background
      },
      width: 300, // Higher resolution
    });

    return {
      secret: secret.base32,
      qrCode: qrCode, // Return the full data URL
      otpauthUrl: secret.otpauth_url, // Optional: Send the URL for direct frontend use
    };
  }

  /**
   * Verify a 2FA code
   * @param userId The user ID
   * @param code The verification code
   * @returns Whether the verification was successful
   */
  async verify2FA(userId: string, code: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Invalid user or 2FA not initialized');
    }

    // Verify the code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) {
      return { verified: false };
    }

    // If valid and 2FA is not yet enabled, enable it
    if (!user.twoFactorEnabled) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });
    }

    return { verified: true };
  }

  /**
   * Disable 2FA for a user
   * @param userId The user ID
   * @param code The verification code
   * @returns Success status
   */
  async disable2FA(userId: string, code: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      throw new BadRequestException('User not found or 2FA not enabled');
    }

    // Verify the code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Disable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { success: true };
  }

  /**
   * Verify 2FA during login
   * @param email User email
   * @param password User password
   * @param code Verification code
   * @returns Login response
   */
  async verify2FALogin(email: string, password: string, code: string) {
    // First validate the user credentials
    const user = await this.authService.validateUser(email, password);

    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      throw new BadRequestException('User not found or 2FA not enabled');
    }

    // Verify the code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Generate JWT token directly instead of calling authService.login
    const payload = { email: user.email, sub: user.id, role: user.role };

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async isTwoFactorEnabled(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    return {
      status: user.twoFactorEnabled,
    };
  }
}
