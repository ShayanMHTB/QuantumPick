import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PermissionProgress } from '@/components/shared/PermissionProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import usePermission from '@/hooks/usePermission';
import { useTranslation } from '@/i18n';
import { Permission } from '@/types/permission.types';
import { useAppSelector } from '@/store';

export function ProfilePermissions() {
  const { t } = useTranslation('dashboard');
  const { user } = useAppSelector((state) => state.auth);
  const { hasPermission, checkLotteryCreationEligibility } = usePermission();
  const [createLotteryEligibility, setCreateLotteryEligibility] =
    useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        setLoading(true);
        const data = await checkLotteryCreationEligibility();
        setCreateLotteryEligibility(data);
      } catch (error) {
        console.error('Failed to fetch eligibility:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [checkLotteryCreationEligibility]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.permissions.title')}</CardTitle>
          <CardDescription>
            {t('profile.permissions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('profile.permissions.yourPermissions')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {user?.permissions?.length ? (
                user.permissions.map((permission) => (
                  <Badge key={permission} variant="secondary">
                    {t(`permissions.${permission}.name`)}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('profile.permissions.noPermissions')}
                </p>
              )}
            </div>
          </div>

          {/* Permission Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t('profile.permissions.progressTitle')}
            </h3>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : (
              createLotteryEligibility && (
                <PermissionProgress
                  permission={Permission.CREATE_LOTTERY}
                  metrics={createLotteryEligibility.metrics}
                  threshold={createLotteryEligibility.threshold}
                  progress={createLotteryEligibility.progress}
                />
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
