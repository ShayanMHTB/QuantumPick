import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Controllers
import { CoreAuthController } from './controllers/core-auth.controller';
import { Web3AuthController } from './controllers/web3-auth.controller';
import { TwoFactorController } from './controllers/two-factor.controller';

// Services
import { CoreAuthService } from './services/core-auth.service';
import { Web3AuthService } from './services/web3-auth.service';
import { TwoFactorService } from './services/two-factor.service';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';

// Modules
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../integrations/prisma/prisma.module';

// Config
import { AuthConfigService } from '../../config/services/auth-config.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [AuthConfigService],
      useFactory: (authConfigService: AuthConfigService) =>
        authConfigService.getJwtConfig(),
    }),
  ],
  controllers: [CoreAuthController, Web3AuthController, TwoFactorController],
  providers: [CoreAuthService, Web3AuthService, TwoFactorService, JwtStrategy],
  exports: [CoreAuthService, Web3AuthService, TwoFactorService],
})
export class AuthModule {}
