import { Module } from '@nestjs/common';
import { PrismaModule } from '../../integrations/prisma/prisma.module';
import { RabbitMQConfigModule } from '../../integrations/rabbitmq/rabbitmq.module';

import { ProfilesController } from './controllers/profiles.controller';
import { UsersController } from './controllers/users.controller';
import { PermissionsController } from './controllers/permissions.controller';

import { ProfilesService } from './services/profiles.service';
import { UsersService } from './services/users.service';
import { PermissionsService } from './services/permissions.service';
import { UserMetricsService } from './services/user-metrics.service';
import { UserPermissionsConsumer } from './consumers/user-permissions.consumer';

@Module({
  imports: [PrismaModule, RabbitMQConfigModule],
  controllers: [UsersController, ProfilesController, PermissionsController],
  providers: [
    UsersService,
    ProfilesService,
    PermissionsService,
    UserMetricsService,
    UserPermissionsConsumer,
  ],
  exports: [
    UsersService,
    ProfilesService,
    PermissionsService,
    UserMetricsService,
  ],
})
export class UsersModule {}
