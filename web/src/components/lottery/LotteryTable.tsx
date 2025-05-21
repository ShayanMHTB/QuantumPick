import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Lottery } from '@/data/mockLotteries';
import { useTranslation } from '@/i18n';
import { LotteryActions } from './LotteryActions';
import { LotteryStatusBadge } from './LotteryStatusBadge';

interface LotteryTableProps {
  lotteries: Lottery[];
  isLoading: boolean;
  currentUserId?: string;
  onAction: (action: 'view' | 'buy' | 'edit' | 'delete', id: string) => void;
}

export const LotteryTable = ({
  lotteries,
  isLoading,
  currentUserId = 'user-123', // Default for mock
  onAction,
}: LotteryTableProps) => {
  const { t } = useTranslation('dashboard');

  // Time formatting function
  const formatTimeRemaining = (endTimeStr: string) => {
    const endTime = new Date(endTimeStr);
    const now = new Date();

    if (endTime < now) {
      return 'Ended';
    }

    const diffMs = endTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    if (diffDays > 0) {
      return `${diffDays}d ${diffHrs}h`;
    } else {
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHrs}h ${diffMins}m`;
    }
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('lotteries.table.name')}</TableHead>
            <TableHead>{t('lotteries.table.type')}</TableHead>
            <TableHead>{t('lotteries.table.status')}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t('lotteries.table.prize')}
            </TableHead>
            <TableHead className="hidden md:table-cell">
              {t('lotteries.table.participants')}
            </TableHead>
            <TableHead className="hidden md:table-cell">
              {t('lotteries.table.timeLeft')}
            </TableHead>
            <TableHead className="text-right">
              {t('lotteries.table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    );
  }

  if (lotteries.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('lotteries.table.name')}</TableHead>
            <TableHead>{t('lotteries.table.type')}</TableHead>
            <TableHead>{t('lotteries.table.status')}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t('lotteries.table.prize')}
            </TableHead>
            <TableHead className="hidden md:table-cell">
              {t('lotteries.table.participants')}
            </TableHead>
            <TableHead className="hidden md:table-cell">
              {t('lotteries.table.timeLeft')}
            </TableHead>
            <TableHead className="text-right">
              {t('lotteries.table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center py-6 text-muted-foreground"
            >
              {t('lotteries.noLotteries')}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('lotteries.table.name')}</TableHead>
          <TableHead>{t('lotteries.table.type')}</TableHead>
          <TableHead>{t('lotteries.table.status')}</TableHead>
          <TableHead className="hidden md:table-cell">
            {t('lotteries.table.prize')}
          </TableHead>
          <TableHead className="hidden md:table-cell">
            {t('lotteries.table.participants')}
          </TableHead>
          <TableHead className="hidden md:table-cell">
            {t('lotteries.table.timeLeft')}
          </TableHead>
          <TableHead className="text-right">
            {t('lotteries.table.actions')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lotteries.map((lottery) => (
          <TableRow key={lottery.id}>
            <TableCell className="font-medium">
              {lottery.title}
              {lottery.creatorId === currentUserId && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {t('lotteries.table.yours')}
                </Badge>
              )}
            </TableCell>
            <TableCell className="capitalize">{lottery.type}</TableCell>
            <TableCell>
              <LotteryStatusBadge status={lottery.status} />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {lottery.prize}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {lottery.participants}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {formatTimeRemaining(lottery.endTime)}
            </TableCell>
            <TableCell className="text-right">
              <LotteryActions
                lotteryId={lottery.id}
                status={lottery.status}
                isCreator={lottery.creatorId === currentUserId}
                onAction={onAction}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
