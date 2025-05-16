import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/integrations/prisma/prisma.service';

import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if profile exists
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      return this.prisma.userProfile.create({
        data: {
          userId,
          ...updateProfileDto,
        },
      });
    }

    // Update existing profile
    return this.prisma.userProfile.update({
      where: { userId },
      data: updateProfileDto,
    });
  }

  async getPublicProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: {
        displayName: true,
        avatarUrl: true,
        bio: true,
        socialLinks: true,
        // Exclude sensitive information
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async getProfilesByDisplayName(displayName: string) {
    return this.prisma.userProfile.findMany({
      where: {
        displayName: {
          contains: displayName,
          mode: 'insensitive',
        },
      },
      select: {
        userId: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        // Include basic public information
      },
    });
  }

  async updatePreferences(userId: string, preferences: Record<string, any>) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Merge existing preferences with new ones
    const updatedPreferences = {
      ...((profile.preferences as Record<string, any>) || {}),
      ...preferences,
    };

    return this.prisma.userProfile.update({
      where: { userId },
      data: {
        preferences: updatedPreferences,
      },
    });
  }
}
