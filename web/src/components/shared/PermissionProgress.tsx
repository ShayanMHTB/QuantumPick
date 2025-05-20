import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Permission } from '@/types/permission.types';
import { useTranslation } from '@/i18n';

interface PermissionProgressProps {
  permission: Permission;
  metrics: {
    ticketsPurchased: number;
    amountSpent: number;
  };
  threshold: {
    minTickets: number;
    minSpent: number;
  };
  progress: number;
}

export const PermissionProgress = ({
  permission,
  metrics,
  threshold,
  progress,
}: PermissionProgressProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">{t('permissions.progress.title')}</h3>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {progress === 100
            ? t('permissions.progress.complete')
            : t('permissions.progress.incomplete', { percent: progress })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background rounded-lg border p-4">
          <h4 className="text-sm font-medium mb-2">
            {t('permissions.metrics.ticketsPurchased.label')}
          </h4>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{metrics.ticketsPurchased}</div>
            <div className="text-sm text-muted-foreground">
              / {threshold.minTickets}{' '}
              {t('permissions.metrics.ticketsPurchased.unit')}
            </div>
          </div>
          <Progress
            value={(metrics.ticketsPurchased / threshold.minTickets) * 100}
            className="h-1 mt-2"
          />
        </div>

        <div className="bg-background rounded-lg border p-4">
          <h4 className="text-sm font-medium mb-2">
            {t('permissions.metrics.amountSpent.label')}
          </h4>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.amountSpent)}
            </div>
            <div className="text-sm text-muted-foreground">
              / {formatCurrency(threshold.minSpent)}{' '}
              {t('permissions.metrics.amountSpent.unit')}
            </div>
          </div>
          <Progress
            value={(metrics.amountSpent / threshold.minSpent) * 100}
            className="h-1 mt-2"
          />
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
        <h3 className="text-green-800 dark:text-green-400 font-medium mb-2">
          {t('permissions.howToGain.title')}
        </h3>
        <p className="text-green-700 dark:text-green-500 text-sm mb-3">
          {t('permissions.howToGain.description')}
        </p>
        <ul className="list-disc ml-5 text-sm text-green-700 dark:text-green-500 space-y-1">
          <li>{t('permissions.howToGain.buyTickets')}</li>
          <li>{t('permissions.howToGain.participateRegularly')}</li>
        </ul>
      </div>
    </div>
  );
};
