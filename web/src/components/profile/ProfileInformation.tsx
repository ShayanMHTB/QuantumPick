'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n';
import useAuth from '@/hooks/useAuth';
import useProfile from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  RiEdit2Line,
  RiSaveLine,
  RiCloseLine,
  RiUpload2Line,
} from 'react-icons/ri';
import {
  UpdateProfileRequest,
  UpdatePreferencesRequest,
} from '@/types/profile.types';

export function ProfileInformation() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { profile, isLoading, isUpdating, updateProfile, updatePreferences } =
    useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  useEffect(() => {
    // Update edited profile when profile data is loaded
    if (profile) {
      setEditedProfile({
        ...profile,
        // Ensure socialLinks exists
        socialLinks: profile.socialLinks || {
          twitter: '',
          discord: '',
          telegram: '',
        },
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setEditedProfile({
        ...profile,
        socialLinks: profile.socialLinks || {
          twitter: '',
          discord: '',
          telegram: '',
        },
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    const profileData: UpdateProfileRequest = {
      displayName: editedProfile.displayName,
      bio: editedProfile.bio,
      socialLinks: editedProfile.socialLinks,
    };

    const success = await updateProfile(profileData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!editedProfile) return;

    const { name, value } = e.target;
    setEditedProfile((prev) => {
      if (!prev) return prev;

      if (name.includes('.')) {
        // Handle nested properties (e.g., socialLinks.twitter)
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleToggleChange = async (name: string, checked: boolean) => {
    if (!profile) return;

    if (name.includes('.')) {
      // Handle nested properties (e.g., preferences.emailNotifications)
      const [parent, child] = name.split('.');

      if (parent === 'preferences') {
        const data: UpdatePreferencesRequest = {
          [child as keyof UpdatePreferencesRequest]: checked,
        };

        await updatePreferences(data);
      }
    }
  };

  // Format join date
  const formatJoinDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t('profile.profileInfo.title')}</CardTitle>
            <CardDescription>
              {t('profile.profileInfo.description')}
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit} disabled={isLoading || !profile}>
              <RiEdit2Line className="mr-2 h-4 w-4" />
              {t('profile.actions.edit')}
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                <RiCloseLine className="mr-2 h-4 w-4" />
                {t('profile.actions.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t('profile.actions.saving')}
                  </span>
                ) : (
                  <>
                    <RiSaveLine className="mr-2 h-4 w-4" />
                    {t('profile.actions.save')}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading || !profile ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex justify-center">
                  <Skeleton className="h-32 w-32 rounded-full" />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar section */}
              <div className="md:w-1/3 flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={profile?.avatarUrl || ''}
                    alt={profile?.displayName}
                  />
                  <AvatarFallback className="text-4xl">
                    {profile?.displayName?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <RiUpload2Line className="mr-2 h-4 w-4" />
                    {t('profile.actions.uploadAvatar')}
                  </Button>
                )}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('profile.profileInfo.joined', {
                      date: profile?.createdAt
                        ? formatJoinDate(profile.createdAt)
                        : '',
                    })}
                  </p>
                </div>
              </div>

              {/* Profile fields */}
              <div className="md:w-2/3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('profile.profileInfo.email')}
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    {t('profile.profileInfo.displayName')}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      name="displayName"
                      value={editedProfile?.displayName || ''}
                      onChange={handleInputChange}
                      placeholder={t('profile.placeholders.displayName')}
                    />
                  ) : (
                    <Input
                      id="displayName"
                      value={profile?.displayName || ''}
                      disabled
                      className="bg-muted/50"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t('profile.profileInfo.bio')}</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      name="bio"
                      value={editedProfile?.bio || ''}
                      onChange={handleInputChange}
                      placeholder={t('profile.placeholders.bio')}
                      rows={4}
                    />
                  ) : (
                    <Textarea
                      id="bio"
                      value={profile?.bio || ''}
                      disabled
                      className="bg-muted/50"
                      rows={4}
                    />
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">
                    {t('profile.profileInfo.socialLinks')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">
                        {t('profile.profileInfo.twitter')}
                      </Label>
                      {isEditing ? (
                        <div className="flex">
                          <span className="bg-muted px-3 py-1 border border-r-0 rounded-l-md text-muted-foreground">
                            @
                          </span>
                          <Input
                            id="twitter"
                            name="socialLinks.twitter"
                            value={editedProfile?.socialLinks?.twitter || ''}
                            onChange={handleInputChange}
                            className="rounded-l-none"
                            placeholder={t('profile.placeholders.twitter')}
                          />
                        </div>
                      ) : (
                        <Input
                          id="twitter"
                          value={
                            profile?.socialLinks?.twitter
                              ? `@${profile.socialLinks.twitter}`
                              : ''
                          }
                          disabled
                          className="bg-muted/50"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discord">
                        {t('profile.profileInfo.discord')}
                      </Label>
                      {isEditing ? (
                        <Input
                          id="discord"
                          name="socialLinks.discord"
                          value={editedProfile?.socialLinks?.discord || ''}
                          onChange={handleInputChange}
                          placeholder={t('profile.placeholders.discord')}
                        />
                      ) : (
                        <Input
                          id="discord"
                          value={profile?.socialLinks?.discord || ''}
                          disabled
                          className="bg-muted/50"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telegram">
                        {t('profile.profileInfo.telegram')}
                      </Label>
                      {isEditing ? (
                        <Input
                          id="telegram"
                          name="socialLinks.telegram"
                          value={editedProfile?.socialLinks?.telegram || ''}
                          onChange={handleInputChange}
                          placeholder={t('profile.placeholders.telegram')}
                        />
                      ) : (
                        <Input
                          id="telegram"
                          value={profile?.socialLinks?.telegram || ''}
                          disabled
                          className="bg-muted/50"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.notifications.title')}</CardTitle>
          <CardDescription>
            {t('profile.notifications.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading || !profile ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">
                    {t('profile.notifications.emailNotifications')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.notifications.emailDescription')}
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={profile?.preferences?.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleToggleChange(
                      'preferences.emailNotifications',
                      checked,
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pushNotifications">
                    {t('profile.notifications.pushNotifications')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.notifications.pushDescription')}
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={profile?.preferences?.pushNotifications}
                  onCheckedChange={(checked) =>
                    handleToggleChange('preferences.pushNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketingEmails">
                    {t('profile.notifications.marketingEmails')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.notifications.marketingDescription')}
                  </p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={profile?.preferences?.marketingEmails}
                  onCheckedChange={(checked) =>
                    handleToggleChange('preferences.marketingEmails', checked)
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
