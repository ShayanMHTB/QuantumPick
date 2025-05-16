import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CoreAuthService } from '../services/core-auth.service';

@ApiTags('auth')
@Controller('auth')
export class CoreAuthController {
  constructor(private readonly coreAuthService: CoreAuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user (traditional)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  register(@Body() registerDto: RegisterDto) {
    return this.coreAuthService.register(
      registerDto.email,
      registerDto.password,
      registerDto.displayName,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user (traditional)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.coreAuthService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.coreAuthService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req) {
    return { message: 'Logout successful' };
  }
}
