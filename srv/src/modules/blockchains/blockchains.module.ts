import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockchainsMockService } from './services/blockchains.mock.service';
import { PrismaModule } from 'src/integrations/prisma/prisma.module';
import { BlockchainsService } from './services/blockchains.service';
import { LotteryDeployConsumer } from './consumers/lottery-deploy.consumer';
import { BlockchainEventListener } from './listeners/blockchain-event.listener';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    // Main blockchain service
    BlockchainsService,
    // Mock service for development
    BlockchainsMockService,
    // Event handling components
    LotteryDeployConsumer,
    BlockchainEventListener,

    // Provider factory based on environment
    {
      provide: 'BLOCKCHAIN_SERVICE',
      useFactory: (configService: ConfigService) => {
        const useRealBlockchain =
          configService.get('USE_REAL_BLOCKCHAIN') === 'true';

        return useRealBlockchain
          ? new BlockchainsService(configService)
          : new BlockchainsMockService();
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    // Use real service by default
    BlockchainsService,
    // Also export the event listener for use in other modules
    BlockchainEventListener,

    'BLOCKCHAIN_SERVICE',
  ],
})
export class BlockchainsModule {}
