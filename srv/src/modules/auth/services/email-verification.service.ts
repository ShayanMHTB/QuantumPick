import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { EmailService } from 'src/integrations/email/email.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailVerificationService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async generateVerificationToken(userId: string, email: string) {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');

    // Store the token in the database with expiration
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days expiration

    // Delete any existing tokens for this user
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });

    // Create new token
    const verificationToken = await this.prisma.emailVerificationToken.create({
      data: {
        token,
        userId,
        email,
        expiresAt: expirationDate,
      },
    });

    return verificationToken;
  }

  async sendVerificationEmail(userId: string, email: string) {
    // Generate token
    const verificationToken = await this.generateVerificationToken(
      userId,
      email,
    );

    // Send email with verification URL
    const result = await this.emailService.sendVerificationEmail(
      email,
      verificationToken.token,
    );

    return {
      success: result.success,
      message: 'Verification email sent',
      previewUrl: result.previewUrl,
    };
  }

  async verifyEmail(token: string) {
    // Find the token in database
    const verificationRecord =
      await this.prisma.emailVerificationToken.findFirst({
        where: {
          token,
          expiresAt: { gt: new Date() }, // Check if not expired
        },
      });

    if (!verificationRecord) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user as verified
    await this.prisma.user.update({
      where: { id: verificationRecord.userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Delete the used token
    await this.prisma.emailVerificationToken.delete({
      where: { id: verificationRecord.id },
    });

    return { success: true, message: 'Email successfully verified' };
  }

  async resendVerificationEmail(userId: string) {
    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      throw new BadRequestException('User not found or has no email address');
    }

    if (user.isEmailVerified) {
      return { success: false, message: 'Email is already verified' };
    }

    // Send a new verification email
    return this.sendVerificationEmail(userId, user.email);
  }

  async isEmailVerified(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isEmailVerified: true },
    });

    return user?.isEmailVerified || false;
  }
}
