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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lottery } from '@/data/mockLotteries';
import { useTranslation } from '@/i18n';
import { getUserData } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  RiArrowGoBackLine,
  RiDeleteBinLine,
  RiEditLine,
  RiPauseLine,
  RiPlayLine,
  RiShareForwardLine,
  RiTicket2Line,
} from 'react-icons/ri';

interface LotteryDetailActionsProps {
  lottery: Lottery;
}

export const LotteryActions = ({ lottery }: LotteryDetailActionsProps) => {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Check if current user is the creator
  const currentUser = getUserData();
  const isCreator = currentUser?.id === lottery.creatorId;

  const handleAction = (action: string) => {
    switch (action) {
      case 'buy':
        router.push(`/dashboard/lotteries/${lottery.id}/buy`);
        break;
      case 'edit':
        router.push(`/dashboard/lotteries/${lottery.id}/edit`);
        break;
      case 'pause':
        console.log('Pause lottery', lottery.id);
        break;
      case 'resume':
        console.log('Resume lottery', lottery.id);
        break;
      case 'share':
        // Copy the lottery URL to clipboard
        navigator.clipboard.writeText(window.location.href);
        // Would show a toast notification in a real app
        console.log('Lottery URL copied to clipboard');
        break;
      case 'delete':
        setIsDeleteDialogOpen(true);
        break;
      default:
        break;
    }
  };

  const handleDelete = () => {
    console.log('Delete lottery', lottery.id);
    // In a real app, would dispatch the delete action
    router.push('/dashboard/lotteries');
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('lotteries.detail.actions')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Primary action - Buy tickets */}
          {lottery.status === 'active' && (
            <Button
              className="w-full justify-between"
              onClick={() => handleAction('buy')}
              size="lg"
            >
              {t('lotteries.actions.buyTickets')}
              <RiTicket2Line className="h-5 w-5" />
            </Button>
          )}

          {/* Secondary actions for creator */}
          {isCreator && (
            <div className="grid grid-cols-2 gap-2">
              {/* Edit button */}
              {['draft', 'pending'].includes(lottery.status) && (
                <Button variant="outline" onClick={() => handleAction('edit')}>
                  <RiEditLine className="h-4 w-4 mr-2" />
                  {t('lotteries.actions.edit')}
                </Button>
              )}

              {/* Pause/Resume button */}
              {lottery.status === 'active' ? (
                <Button variant="outline" onClick={() => handleAction('pause')}>
                  <RiPauseLine className="h-4 w-4 mr-2" />
                  {t('lotteries.detail.pause')}
                </Button>
              ) : (
                lottery.status === 'paused' && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction('resume')}
                  >
                    <RiPlayLine className="h-4 w-4 mr-2" />
                    {t('lotteries.detail.resume')}
                  </Button>
                )
              )}

              {/* Delete button */}
              {['draft', 'pending'].includes(lottery.status) && (
                <Button
                  variant="destructive"
                  onClick={() => handleAction('delete')}
                >
                  <RiDeleteBinLine className="h-4 w-4 mr-2" />
                  {t('lotteries.actions.delete')}
                </Button>
              )}

              {/* Share button - always visible */}
              <Button variant="outline" onClick={() => handleAction('share')}>
                <RiShareForwardLine className="h-4 w-4 mr-2" />
                {t('lotteries.detail.share')}
              </Button>
            </div>
          )}

          {/* Return to lotteries list */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push('/dashboard/lotteries')}
          >
            <RiArrowGoBackLine className="h-4 w-4 mr-2" />
            {t('lotteries.detail.backToLotteries')}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
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
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
