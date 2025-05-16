import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from 'src/integrations/prisma/prisma.module';
import { BlockchainsModule } from '../blockchains/blockchains.module';

import { TransactionsService } from './services/transactions.service';
import { TransactionVerificationService } from './services/transaction-verification.service';
import { PlatformEarningsService } from './services/platform-earnings.service';
import { TransactionsController } from './controllers/transactions.controller';
import { TransactionProcessor } from './consumers/transaction.processor';

@Module({
  imports: [
    PrismaModule,
    BlockchainsModule,
    BullModule.registerQueue({
      name: 'transactions',
    }),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionVerificationService,
    PlatformEarningsService,
    TransactionProcessor,
  ],
  exports: [TransactionsService, TransactionVerificationService],
})
export class TransactionsModule {}
