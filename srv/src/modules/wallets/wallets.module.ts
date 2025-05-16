import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/integrations/prisma/prisma.module';
import { WalletsController } from './controllers/wallets.controller';
import { WalletsService } from './services/wallets.service';

@Module({
  imports: [PrismaModule],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
