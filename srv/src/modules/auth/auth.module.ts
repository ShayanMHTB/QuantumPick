// src/modules/auth/auth.module.ts
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Controllers
import { CoreAuthController } from './controllers/core-auth.controller';
import { Web3AuthController } from './controllers/web3-auth.controller';
import { TwoFactorController } from './controllers/two-factor.controller';
import { EmailVerificationController } from './controllers/email-verification.controller';

// Services
import { CoreAuthService } from './services/core-auth.service';
import { Web3AuthService } from './services/web3-auth.service';
import { TwoFactorService } from './services/two-factor.service';
import { EmailVerificationService } from './services/email-verification.service';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';

// Middlewares
import { EmailVerificationMiddleware } from './middlewares/email-verification.middleware';

// Modules
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { EmailModule } from '../../integrations/email/email.module';

// Config
import { AuthConfigService } from '../../config/services/auth-config.service';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [AuthConfigService],
      useFactory: (authConfigService: AuthConfigService) =>
        authConfigService.getJwtConfig(),
    }),
  ],
  controllers: [
    CoreAuthController,
    Web3AuthController,
    TwoFactorController,
    EmailVerificationController,
  ],
  providers: [
    CoreAuthService,
    Web3AuthService,
    TwoFactorService,
    EmailVerificationService,
    JwtStrategy,
  ],
  exports: [
    CoreAuthService,
    Web3AuthService,
    TwoFactorService,
    EmailVerificationService,
  ],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply email verification middleware to dashboard routes
    consumer
      .apply(EmailVerificationMiddleware)
      .exclude(
        { path: 'auth/email/verify', method: RequestMethod.POST },
        { path: 'auth/email/resend', method: RequestMethod.POST },
        { path: 'auth/email/status', method: RequestMethod.GET },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/siwe/message', method: RequestMethod.POST },
        { path: 'auth/siwe/verify', method: RequestMethod.POST },
        { path: 'auth/2fa/login', method: RequestMethod.POST },
      )
      .forRoutes('/dashboard/*'); // Apply to all dashboard routes
  }
}
