import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import usePermission from '@/hooks/usePermission';
import { useTranslation } from '@/i18n';
import { Permission } from '@/types/permission.types';
import {
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiMoreLine,
  RiTicket2Line,
} from 'react-icons/ri';

interface LotteryActionsProps {
  lotteryId: string;
  status: string;
  isCreator: boolean;
  onAction: (action: 'view' | 'buy' | 'edit' | 'delete', id: string) => void;
}

export const LotteryActions = ({
  lotteryId,
  status,
  isCreator,
  onAction,
}: LotteryActionsProps) => {
  const { t } = useTranslation('dashboard');
  const { hasPermission } = usePermission();
  const canEditLottery = hasPermission(Permission.EDIT_LOTTERY);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <RiMoreLine className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('lotteries.table.actions')}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onAction('view', lotteryId)}>
          <RiEyeLine className="mr-2 h-4 w-4" />
          {t('lotteries.actions.view')}
        </DropdownMenuItem>
        {status === 'active' && (
          <DropdownMenuItem onClick={() => onAction('buy', lotteryId)}>
            <RiTicket2Line className="mr-2 h-4 w-4" />
            {t('lotteries.actions.buyTickets')}
          </DropdownMenuItem>
        )}
        {(isCreator || canEditLottery) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction('edit', lotteryId)}
              className={
                status === 'completed' || status === 'cancelled'
                  ? 'text-muted cursor-not-allowed'
                  : ''
              }
              disabled={status === 'completed' || status === 'cancelled'}
            >
              <RiEditLine className="mr-2 h-4 w-4" />
              {t('lotteries.actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction('delete', lotteryId)}
              className="text-red-600 focus:text-red-600"
            >
              <RiDeleteBinLine className="mr-2 h-4 w-4" />
              {t('lotteries.actions.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
