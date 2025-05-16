import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  getJwtConfig() {
    return {
      secret: this.configService.get<string>('jwt.secret'),
      signOptions: {
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      },
    };
  }

  getSiweConfig() {
    return {
      domain: this.configService.get<string>('siwe.domain'),
      origin: this.configService.get<string>('siwe.origin'),
      statement: this.configService.get<string>('siwe.statement'),
      version: this.configService.get<string>('siwe.version'),
      chainId: this.configService.get<number>('siwe.chainId'),
    };
  }

  getTwoFactorConfig() {
    return {
      // Add any 2FA specific config here
      expiryTime:
        this.configService.get<number>('twoFactor.expiryTime') || 5 * 60 * 1000, // Default 5 minutes
    };
  }
}
