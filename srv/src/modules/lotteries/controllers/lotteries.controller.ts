import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from 'src/modules/auth/decorators/permissions.decorator';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Permission } from 'src/modules/users/entities/permissions.entity';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { CreateLotteryDto } from '../dtos/create-lottery.dto';
import { LotteryStatus, LotteryType } from '../entities/lottery.entity';
import { LotteriesService } from '../services/lotteries.service';
import { LotteryTemplateService } from '../services/lottery-template.service';

@ApiTags('lotteries')
@Controller('lotteries')
export class LotteriesController {
  constructor(
    private readonly lotteriesService: LotteriesService,
    private readonly lotteryTemplateService: LotteryTemplateService,
  ) {}

  // Get all available templates
  @Get('templates')
  @ApiOperation({ summary: 'Get all lottery templates' })
  @ApiResponse({ status: 200, description: 'Returns all lottery templates' })
  getAllTemplates() {
    return this.lotteryTemplateService.getAllTemplates();
  }

  // Get template by ID
  @Get('templates/:id')
  @ApiOperation({ summary: 'Get lottery template by ID' })
  @ApiResponse({ status: 200, description: 'Returns template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  getTemplateById(@Param('id') id: string) {
    return this.lotteryTemplateService.getTemplateById(id);
  }

  // Check user eligibility for creating lotteries
  @Get('eligibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check user eligibility for lottery creation' })
  @ApiResponse({ status: 200, description: 'Returns eligibility status' })
  async checkEligibility(@Req() req) {
    const isEligible =
      await this.lotteryTemplateService.validateUserEligibility(
        req.user.userId,
      );

    return {
      eligible: isEligible,
      requirements: {
        minTickets: 10,
        minSpent: 50,
      },
    };
  }

  @Get('creation-fee')
  @ApiOperation({ summary: 'Get lottery creation fee' })
  async getCreationFee(
    @Query('templateId') templateId: string = 'basic',
    @Query('prizePool') prizePool: number = 5000,
    @Query('chainId') chainId: number = 1337,
  ) {
    if (!templateId || !prizePool) {
      throw new BadRequestException('Template ID and prize pool are required');
    }

    const fee = this.lotteryTemplateService.calculateCreationFee(
      templateId,
      prizePool,
    );

    // Get platform address from transaction verification service
    const platformAddress =
      this.lotteriesService.getPlatformFeeAddress(chainId);

    return {
      fee,
      platformAddress,
      chainId,
      templateId,
      prizePool,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.CREATE_LOTTERY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lottery' })
  @ApiResponse({ status: 201, description: 'Lottery created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions or ineligible user',
  })
  async create(@Body() createLotteryDto: CreateLotteryDto, @Req() req) {
    // Validate user eligibility
    const isEligible =
      await this.lotteryTemplateService.validateUserEligibility(
        req.user.userId,
      );

    if (!isEligible) {
      throw new BadRequestException(
        'User is not eligible to create lotteries. Must have purchased at least 10 tickets and spent at least $50.',
      );
    }

    // Validate lottery parameters against template
    this.lotteryTemplateService.validateLotteryParams(
      createLotteryDto.templateId,
      createLotteryDto.ticketPrice,
      createLotteryDto.prizePool,
      createLotteryDto.startTime
        ? new Date(createLotteryDto.startTime)
        : undefined,
      createLotteryDto.endTime ? new Date(createLotteryDto.endTime) : undefined,
    );

    // Calculate creation fee
    const creationFee = this.lotteryTemplateService.calculateCreationFee(
      createLotteryDto.templateId,
      createLotteryDto.prizePool,
    );

    // Calculate minimum tickets needed
    const minTickets = this.lotteryTemplateService.calculateMinTickets(
      createLotteryDto.prizePool,
      createLotteryDto.ticketPrice,
    );

    // Pass to service for creation
    return this.lotteriesService.createFromTemplate(
      createLotteryDto,
      req.user.userId,
      creationFee,
      minTickets,
    );
  }

  // Keep existing endpoints
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

  @Get(':id')
  @ApiOperation({ summary: 'Get lottery by ID' })
  @ApiResponse({ status: 200, description: 'Returns lottery details' })
  @ApiResponse({ status: 404, description: 'Lottery not found' })
  findOne(@Param('id') id: string) {
    return this.lotteriesService.findOne(id);
  }

  @Post(':id/deploy')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions(Permission.CREATE_LOTTERY)
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
