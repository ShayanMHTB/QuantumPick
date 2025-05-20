import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CreateLotteryForm } from './CreateLotteryForm';
import { PermissionProgress } from '@/components/shared/PermissionProgress';
import { useTranslation } from '@/i18n';
import usePermission from '@/hooks/usePermission';
import { Permission } from '@/types/permission.types';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { checkEligibility } from '@/store/slices/lotterySlice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RiAlertLine } from 'react-icons/ri';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateLotteryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateLotteryDialog = ({
  isOpen,
  onClose,
}: CreateLotteryDialogProps) => {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();
  const { hasPermission } = usePermission();
  const { eligibility, isLoading } = useAppSelector((state) => state.lottery);

  const canCreateLottery = hasPermission(Permission.CREATE_LOTTERY);

  useEffect(() => {
    if (isOpen && !canCreateLottery && !eligibility) {
      dispatch(checkEligibility());
    }
  }, [isOpen, canCreateLottery, eligibility, dispatch]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 h-[80vh] max-h-[800px]">
        {canCreateLottery ? (
          <CreateLotteryForm onSuccess={onClose} onCancel={onClose} />
        ) : (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {t('lotteries.createDialog.title')}
              </h2>
              <p className="text-muted-foreground mt-1">
                {t('lotteries.createDialog.description')}
              </p>
            </div>

            <div className="space-y-6">
              <Alert variant="warning">
                <RiAlertLine className="h-4 w-4" />
                <AlertTitle>
                  {t('permissions.createLottery.notEligible')}
                </AlertTitle>
                <AlertDescription>
                  {t('permissions.createLottery.requirements')}
                </AlertDescription>
              </Alert>

              {isLoading ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : eligibility ? (
                <ScrollArea className="h-[400px]">
                  <PermissionProgress
                    permission={Permission.CREATE_LOTTERY}
                    metrics={{
                      ticketsPurchased: eligibility.metrics.ticketsPurchased,
                      amountSpent: eligibility.metrics.amountSpent,
                    }}
                    threshold={{
                      minTickets: eligibility.threshold.minTickets,
                      minSpent: eligibility.threshold.minSpent,
                    }}
                    progress={eligibility.progress}
                  />
                </ScrollArea>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
