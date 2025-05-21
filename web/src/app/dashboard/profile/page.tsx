'use client';

import { ProfileInformation } from '@/components/profile/ProfileInformation';
import { ProfilePermissions } from '@/components/profile/ProfilePermissions';
import { ProfileSecurity } from '@/components/profile/ProfileSecurity';
import { ProfileWallets } from '@/components/profile/ProfileWallets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useProfile from '@/hooks/useProfile';
import { useTranslation } from '@/i18n';
import { useEffect } from 'react';
import {
  RiLockLine,
  RiShieldLine,
  RiUser3Line,
  RiWalletLine,
} from 'react-icons/ri';

export default function ProfilePage() {
  const { t } = useTranslation('dashboard');
  const { getProfile, getWallets, isLoading } = useProfile();

  useEffect(() => {
    // Load profile and wallet data when component mounts
    getProfile();
    getWallets();
  }, [getProfile, getWallets]);

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t('profile.title')}
        </h2>
        <p className="text-muted-foreground">{t('profile.description')}</p>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <RiUser3Line className="h-4 w-4 mr-2" />
            {t('profile.tabs.profile')}
          </TabsTrigger>
          <TabsTrigger value="wallets">
            <RiWalletLine className="h-4 w-4 mr-2" />
            {t('profile.tabs.wallets')}
          </TabsTrigger>
          <TabsTrigger value="security">
            <RiLockLine className="h-4 w-4 mr-2" />
            {t('profile.tabs.security')}
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <RiShieldLine className="h-4 w-4 mr-2" />
            {t('profile.tabs.permissions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileInformation />
        </TabsContent>

        <TabsContent value="wallets">
          <ProfileWallets />
        </TabsContent>

        <TabsContent value="security">
          <ProfileSecurity />
        </TabsContent>

        <TabsContent value="permissions">
          <ProfilePermissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
