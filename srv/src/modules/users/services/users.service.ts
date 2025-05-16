import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/integrations/prisma/prisma.service';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserRole, UserStatus } from '../entities/user.entity';
import { hashPassword } from '../helpers/password.helper';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { displayName, avatarUrl, bio, ...userData } = createUserDto;

    // Hash password if provided
    let hashedPassword = null;
    if (userData.password) {
      hashedPassword = await hashPassword(userData.password);
    }

    return this.prisma.user.create({
      data: {
        ...userData,
        hashedPassword,
        profile: {
          create: {
            displayName: displayName || userData.email?.split('@')[0],
            avatarUrl,
            bio,
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async findAll(includeProfile = false) {
    return this.prisma.user.findMany({
      include: {
        profile: includeProfile,
        wallets: includeProfile,
      },
    });
  }

  async findOne(id: string, includeProfile = true) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        wallets: includeProfile,
        profile: includeProfile,
      },
    });
  }

  async findByEmail(email: string, includeProfile = true) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        wallets: includeProfile,
        profile: includeProfile,
      },
    });
  }

  async findByWalletAddress(address: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        user: {
          include: {
            wallets: true,
            profile: true, // Ensures profile is always included
          },
        },
      },
    });

    if (!wallet?.user) {
      return null;
    }

    // If the user exists but doesn't have a profile, we need to handle this
    if (!wallet.user.profile) {
      // Create a default profile for the user
      const profile = await this.prisma.userProfile.create({
        data: {
          userId: wallet.user.id,
          displayName: `User-${address.substring(0, 6)}`,
        },
      });

      // Return the user with the newly created profile
      return {
        ...wallet.user,
        profile,
      };
    }

    return wallet.user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const user = await this.findOne(id, false);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        profile: true,
      },
    });
  }

  async remove(id: string) {
    // Check if user exists
    const user = await this.findOne(id, false);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  // User Role Management
  async upgradeToCreator(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.CREATOR },
    });
  }

  async upgradeToPremium(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.PREMIUM },
    });
  }

  // User Status Management
  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
    });
  }

  async suspendUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED },
    });
  }

  async banUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.BANNED },
    });
  }
}
