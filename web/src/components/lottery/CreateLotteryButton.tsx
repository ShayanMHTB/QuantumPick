import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import usePermission from '@/hooks/usePermission';
import { useTranslation } from '@/i18n';
import { Permission } from '@/types/permission.types';
import { useAppSelector } from '@/store';
import { RiAddLine } from 'react-icons/ri';

interface CreateLotteryButtonProps {
  onClick: () => void;
}

export const CreateLotteryButton = ({ onClick }: CreateLotteryButtonProps) => {
  const { t } = useTranslation('dashboard');
  const { user } = useAppSelector((state) => state.auth);
  const { hasPermission } = usePermission();

  // Check if user is admin or has CREATE_LOTTERY permission
  const canCreateLottery =
    user?.role === 'ADMIN' || hasPermission(Permission.CREATE_LOTTERY);

  if (!canCreateLottery) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                onClick={(e) => e.preventDefault()}
                className="md:self-start cursor-not-allowed opacity-70"
                disabled={true}
              >
                <RiAddLine className="mr-2 h-4 w-4" />
                {t('lotteries.createNew')}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('permissions.noCreateLotteryPermission')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button onClick={onClick} className="md:self-start">
      <RiAddLine className="mr-2 h-4 w-4" />
      {t('lotteries.createNew')}
    </Button>
  );
};
