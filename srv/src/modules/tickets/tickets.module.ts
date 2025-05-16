import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/integrations/prisma/prisma.module';
import { BlockchainsModule } from '../blockchains/blockchains.module';
import { WalletsModule } from '../wallets/wallets.module';
import { TicketPurchaseConsumer } from './consumers/ticket-purchase.consumer';
import { TestingTicketsController } from './controllers/testing-tickets.controller';
import { TicketsController } from './controllers/tickets.controller';
import { TicketPurchaseCompletionService } from './services/ticket-purchase-completion.service';
import { TicketsService } from './services/tickets.service';

@Module({
  imports: [
    PrismaModule,
    BlockchainsModule,
    WalletsModule,
    BullModule.registerQueue({
      name: 'ticket-purchase',
    }),
  ],
  controllers: [TicketsController, TestingTicketsController],
  providers: [
    TicketsService,
    TicketPurchaseConsumer,
    TicketPurchaseCompletionService,
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
