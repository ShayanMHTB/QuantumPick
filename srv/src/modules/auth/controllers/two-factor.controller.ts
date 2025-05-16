import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TwoFactorLoginDto } from '../dtos/two-factor-login.dto';
import { VerifyTwoFactorDto } from '../dtos/two-factor-verify.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TwoFactorService } from '../services/two-factor.service';

@ApiTags('auth')
@Controller('auth/2fa')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({ status: 200, description: 'Returns secret and QR code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  enable2FA(@Req() req) {
    return this.twoFactorService.enable2FA(req.user.userId);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify two-factor authentication setup' })
  @ApiResponse({ status: 200, description: 'Verification status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  verify2FA(@Req() req, @Body() verifyDto: VerifyTwoFactorDto) {
    return this.twoFactorService.verify2FA(req.user.userId, verifyDto.code);
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({ status: 200, description: 'Success status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  disable2FA(@Req() req, @Body() verifyDto: VerifyTwoFactorDto) {
    return this.twoFactorService.disable2FA(req.user.userId, verifyDto.code);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with two-factor authentication' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  login2FA(@Body() loginDto: TwoFactorLoginDto) {
    return this.twoFactorService.verify2FALogin(
      loginDto.email,
      loginDto.password,
      loginDto.code,
    );
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user 2FA status' })
  @ApiResponse({ status: 200, description: 'User 2FA status returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req) {
    return this.twoFactorService.isTwoFactorEnabled(req.user.userId);
  }
}
