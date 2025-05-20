import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthSource } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { EmailVerificationService } from '../services/email-verification.service';

// Extend the Express Request type to include the user property
interface RequestWithUser extends Request {
  user: {
    userId: string;
    email?: string;
    role?: string;
  };
}

@Injectable()
export class EmailVerificationMiddleware implements NestMiddleware {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    // Skip verification if user is not present in request
    if (!req.user || !req.user.userId) {
      return next();
    }

    try {
      // Use the findOne method from your UsersService
      const user = await this.usersService.findOne(req.user.userId);

      // If user is web3 auth only, skip email verification check
      if (user.authSource === AuthSource.WEB3) {
        return next();
      }

      // Check if user's email is verified for TRADITIONAL or BOTH auth types
      const isVerified = await this.emailVerificationService.isEmailVerified(
        req.user.userId,
      );

      if (!isVerified) {
        throw new UnauthorizedException(
          'Email not verified. Please verify your email before accessing this resource.',
        );
      }

      next();
    } catch (error) {
      // If the user is not found or any other error occurs
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid user or session');
    }
  }
}
