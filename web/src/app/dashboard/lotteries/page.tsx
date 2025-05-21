'use client';

import { useState, useEffect } from 'react';
import { LotteryList } from '@/components/lottery/LotteryList';
import { CreateLotteryButton } from '@/components/lottery/CreateLotteryButton';
import { CreateLotteryDialog } from '@/components/lottery/CreateLotteryDialog';
import { useTranslation } from '@/i18n';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLotteries, setMockLotteries } from '@/store/slices/lotterySlice';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import usePermission from '@/hooks/usePermission';
import { Permission } from '@/types/permission.types';
import { Button } from '@/components/ui/button';

export default function LotteriesPage() {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { lotteries, isLoading } = useAppSelector((state) => state.lottery);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    lotteryId: string | null;
  }>({
    isOpen: false,
    lotteryId: null,
  });

  const { hasPermission, checkLotteryCreationEligibility } = usePermission();
  const canCreateLottery = hasPermission(Permission.CREATE_LOTTERY);
  const [eligibility, setEligibility] = useState<any>(null);

  // For development - using mock data
  useEffect(() => {
    // In a real app, we'd dispatch fetchLotteries()
    // But for development, we'll use mock data
    dispatch(setMockLotteries());
  }, [dispatch]);

  useEffect(() => {
    if (!canCreateLottery) {
      checkLotteryCreationEligibility().then(setEligibility);
    }
  }, [canCreateLottery, checkLotteryCreationEligibility]);

  const handleCreateLottery = () => {
    setIsCreateDialogOpen(true);
  };

  const handleLotteryAction = (
    action: 'view' | 'buy' | 'edit' | 'delete',
    id: string,
  ) => {
    switch (action) {
      case 'view':
        router.push(`/dashboard/lotteries/${id}`);
        break;
      case 'buy':
        router.push(`/dashboard/lotteries/${id}/buy`);
        break;
      case 'edit':
        router.push(`/dashboard/lotteries/${id}/edit`);
        break;
      case 'delete':
        setDeleteDialog({ isOpen: true, lotteryId: id });
        break;
    }
  };

  const handleDeleteLottery = async () => {
    if (deleteDialog.lotteryId) {
      try {
        // In a real app, we'd dispatch deleteLottery(deleteDialog.lotteryId)
        console.log(`Deleting lottery ${deleteDialog.lotteryId}`);
        // Simulate success
        setTimeout(() => {
          dispatch(fetchLotteries());
        }, 500);
      } catch (error) {
        console.error('Failed to delete lottery:', error);
      }
    }

    setDeleteDialog({ isOpen: false, lotteryId: null });
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('lotteries.title')}
          </h2>
          <p className="text-muted-foreground">{t('lotteries.description')}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <CreateLotteryButton onClick={handleCreateLottery} />

          {!canCreateLottery && eligibility && !eligibility.eligible && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="text-xs"
            >
              {t('permissions.viewProgress')}
            </Button>
          )}
        </div>
      </div>

      {/* Lottery List Component */}
      <LotteryList
        lotteries={lotteries}
        isLoading={isLoading}
        onAction={handleLotteryAction}
      />

      {/* Create Lottery Dialog */}
      <CreateLotteryDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog({ ...deleteDialog, isOpen })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('lotteries.deleteDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('lotteries.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLottery}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
