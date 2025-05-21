import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { EmailVerificationService } from '../services/email-verification.service';
import { VerifyEmailDto } from '../dtos/verify-email.dto';

@ApiTags('auth')
@Controller('auth/email')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.emailVerificationService.verifyEmail(verifyEmailDto.token);
  }

  @Post('resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerificationEmail(@Req() req) {
    console.log('Resend verification email endpoint hit');
    console.log('User ID:', req.user.userId);
    const result = await this.emailVerificationService.resendVerificationEmail(
      req.user.userId,
    );
    console.log('Resend result:', result);
    return result;
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check email verification status' })
  @ApiResponse({
    status: 200,
    description: 'Email verification status returned',
  })
  async getVerificationStatus(@Req() req) {
    const isVerified = await this.emailVerificationService.isEmailVerified(
      req.user.userId,
    );
    return { isVerified };
  }
}
