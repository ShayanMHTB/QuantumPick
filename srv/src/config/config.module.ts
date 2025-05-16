import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configurationFactory from './config.service';
import { AuthConfigService } from './services/auth-config.service';
import { BlockchainConfigService } from './services/blockchain-config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configurationFactory],
    }),
  ],
  providers: [BlockchainConfigService, AuthConfigService],
  exports: [BlockchainConfigService, AuthConfigService],
})
export class ConfigModule {}
