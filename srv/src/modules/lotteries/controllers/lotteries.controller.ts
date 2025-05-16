import {
  Body,
  Controller,
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
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { CreateLotteryDto } from '../dtos/create-lottery.dto';
import { LotteryStatus, LotteryType } from '../entities/lottery.entity';
import { LotteriesService } from '../services/lotteries.service';

@ApiTags('lotteries')
@Controller('lotteries')
export class LotteriesController {
  constructor(private readonly lotteriesService: LotteriesService) {}

  // Static routes MUST come before dynamic routes

  @Get('creation-fee') // MOVED BEFORE :id
  @ApiOperation({ summary: 'Get lottery creation fee' })
  async getCreationFee(
    @Query('type') type: LotteryType = LotteryType.STANDARD,
    @Query('chainId') chainId: number = 1337,
  ) {
    // Also need to parse the chainId as a number
    const parsedChainId =
      typeof chainId === 'string' ? parseInt(chainId) : chainId;
    return this.lotteriesService.getLotteryCreationFee(type, parsedChainId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CREATOR, UserRole.PREMIUM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lottery' })
  @ApiResponse({ status: 201, description: 'Lottery created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  create(@Body() createLotteryDto: CreateLotteryDto, @Req() req) {
    return this.lotteriesService.create(createLotteryDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lotteries with optional filtering' })
  @ApiResponse({ status: 200, description: 'Returns lotteries' })
  findAll(
    @Query('status') status?: LotteryStatus,
    @Query('chainId') chainId?: number,
    @Query('creatorId') creatorId?: string,
  ) {
    return this.lotteriesService.findAll({
      status,
      chainId: chainId ? +chainId : undefined,
      creatorId,
    });
  }

  // Dynamic routes MUST come after static routes

  @Get(':id')
  @ApiOperation({ summary: 'Get lottery by ID' })
  @ApiResponse({ status: 200, description: 'Returns lottery details' })
  @ApiResponse({ status: 404, description: 'Lottery not found' })
  findOne(@Param('id') id: string) {
    return this.lotteriesService.findOne(id);
  }

  @Post(':id/deploy')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CREATOR, UserRole.PREMIUM)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deploy lottery contract' })
  @ApiResponse({ status: 200, description: 'Deployment successful' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Lottery not found' })
  deployLottery(@Param('id') id: string) {
    return this.lotteriesService.deployLottery(id);
  }

  @Get(':id/deployment-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check lottery deployment status' })
  @ApiResponse({ status: 200, description: 'Returns deployment status' })
  getDeploymentStatus(@Param('id') id: string) {
    return this.lotteriesService.getDeploymentStatus(id);
  }
}
