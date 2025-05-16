import { Module } from '@nestjs/common';

import { PrismaModule } from '../../integrations/prisma/prisma.module';

import { ProfilesController } from './controllers/profiles.controller';
import { UsersController } from './controllers/users.controller';

import { ProfilesService } from './services/profiles.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, ProfilesController],
  providers: [UsersService, ProfilesService],
  exports: [UsersService, ProfilesService],
})
export class UsersModule {}
