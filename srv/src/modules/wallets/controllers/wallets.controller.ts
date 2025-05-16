import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { WalletsService } from '../services/wallets.service';
import { VerifyWalletDto } from '../dtos/verify-wallet.dto';
import { AddWalletDto } from '../dtos/add-wallet.dto';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@ApiTags('wallets')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all wallets for current user' })
  @ApiResponse({ status: 200, description: 'Returns all wallets' })
  findAll(@Req() req, @Query('verified') verified: boolean = false) {
    if (verified) {
      return this.walletsService.findAllVerified(req.user.userId);
    }
    return this.walletsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get one wallet by ID' })
  @ApiResponse({ status: 200, description: 'Returns the wallet' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.walletsService.findOne(id, req.user.userId);
  }

  @Post('verify/message')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a verification message for a wallet' })
  @ApiResponse({ status: 200, description: 'Verification message created' })
  async getVerificationMessage(
    @Body() verifyWalletDto: VerifyWalletDto,
    @Query('chainId') chainId: number = 1,
  ) {
    return this.walletsService.generateVerificationMessage(
      verifyWalletDto.address,
      chainId,
    );
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new wallet with verification' })
  @ApiResponse({ status: 201, description: 'Wallet added successfully' })
  @ApiResponse({ status: 409, description: 'Wallet already exists' })
  @ApiResponse({ status: 401, description: 'Wallet verification failed' })
  addWallet(@Body() addWalletDto: AddWalletDto, @Req() req) {
    return this.walletsService.addWallet(
      req.user.userId,
      addWalletDto.address,
      addWalletDto.chainId,
      addWalletDto.signature,
      addWalletDto.message,
      addWalletDto.nickname,
    );
  }

  @Post(':id/primary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set wallet as primary' })
  @ApiResponse({ status: 200, description: 'Wallet set as primary' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  setPrimary(@Param('id') id: string, @Req() req) {
    return this.walletsService.setPrimary(id, req.user.userId);
  }

  @Get('for-lottery/:lotteryId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get suitable wallet for lottery participation' })
  @ApiResponse({
    status: 200,
    description: 'Returns wallet and lottery details',
  })
  @ApiResponse({ status: 404, description: 'Lottery not found' })
  @ApiResponse({ status: 400, description: 'No suitable wallet found' })
  getWalletForLottery(@Param('lotteryId') lotteryId: string, @Req() req) {
    return this.walletsService.getWalletForTicket(req.user.userId, lotteryId);
  }

  @Post(':id/use')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark wallet as recently used' })
  @ApiResponse({ status: 200, description: 'Wallet updated' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  updateLastUsed(@Param('id') id: string, @Req() req) {
    return this.walletsService.updateLastUsed(id, req.user.userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet removed successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 400, description: 'Cannot remove primary wallet' })
  remove(@Param('id') id: string, @Req() req) {
    return this.walletsService.remove(id, req.user.userId);
  }

  @Post('test-wallet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) // Restrict to admin for safety
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a test wallet (Admin only, development)' })
  addTestWallet(@Body() addWalletDto: AddWalletDto, @Req() req) {
    return this.walletsService.addTestWallet(
      req.user.userId,
      addWalletDto.address,
      addWalletDto.chainId,
      addWalletDto.nickname,
    );
  }
}
