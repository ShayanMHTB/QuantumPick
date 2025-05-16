import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/integrations/prisma/prisma.service';
import { UsersService } from '../../users/services/users.service';
import * as bcrypt from 'bcrypt';
import { AuthSource, UserStatus } from 'src/modules/users/entities/user.entity';

@Injectable()
export class CoreAuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.hashedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Check if user has 2FA enabled
    if (user.twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    }

    // Normal login flow if 2FA not enabled
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(email: string, password: string, displayName?: string) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
        authSource: AuthSource.TRADITIONAL,
        profile: {
          create: {
            displayName: displayName || email.split('@')[0],
          },
        },
      },
    });

    return this.login(user);
  }
}
