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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { BuyTicketDto } from '../dtos/buy-ticket.dto';
import { TicketsService } from '../services/tickets.service';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('buy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buy tickets for a lottery' })
  @ApiResponse({ status: 201, description: 'Ticket purchase initiated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  buyTicket(@Body() buyTicketDto: BuyTicketDto, @Req() req) {
    return this.ticketsService.buyTicket(buyTicketDto, req.user.userId);
  }

  @Get('purchase/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check purchase status' })
  @ApiResponse({ status: 200, description: 'Returns purchase status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getPurchaseStatus(@Param('id') id: string) {
    return this.ticketsService.getPurchaseStatus(id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user tickets' })
  @ApiResponse({ status: 200, description: 'Returns user tickets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserTickets(@Req() req, @Query('lotteryId') lotteryId?: string) {
    return this.ticketsService.getUserTickets(req.user.userId, lotteryId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Returns ticket' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  getTicketById(@Param('id') id: string) {
    return this.ticketsService.getTicketById(id);
  }
}
