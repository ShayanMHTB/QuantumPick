'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchLotteryById } from '@/store/slices/lotterySlice';
import { LotteryDetails } from '@/components/lottery/LotteryDetails';
import { LotteryActions } from '@/components/lottery/LotteryDetailActions';
import { LotteryParticipants } from '@/components/lottery/LotteryParticipants';
import { LotteryPrizeDistribution } from '@/components/lottery/LotteryPrizeDistribution';
import { LotteryTimeline } from '@/components/lottery/LotteryTimeline';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/i18n';
import { RiArrowLeftLine } from 'react-icons/ri';
import { Lottery } from '@/data/mockLotteries';

export default function LotteryDetailPage() {
  const { t } = useTranslation('dashboard');
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const dispatch = useAppDispatch();

  const { currentLottery, isLoading, error } = useAppSelector(
    (state) => state.lottery,
  );

  // For development - create mock participants
  const [mockParticipants, setMockParticipants] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchLotteryById(id));

    // Generate mock participants for demo purposes
    const generateMockParticipants = () => {
      const participants = [];
      for (let i = 1; i <= 18; i++) {
        participants.push({
          id: `user-${i}`,
          address: `0x${Array(40)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join('')}`,
          tickets: Math.floor(Math.random() * 15) + 1,
          joinedAt: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
          ).toISOString(),
          displayName: `User ${i}`,
          avatarUrl: null,
        });
      }
      setMockParticipants(participants);
    };

    generateMockParticipants();
  }, [dispatch, id]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Error Loading Lottery
        </h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Back button */}
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => router.push('/dashboard/lotteries')}
      >
        <RiArrowLeftLine className="h-4 w-4" />
        {t('lotteries.detail.backToLotteries')}
      </Button>

      {isLoading || !currentLottery ? (
        <LotteryDetailSkeleton />
      ) : (
        <>
          {/* Header and main info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main lottery details */}
            <div className="lg:col-span-2 space-y-6">
              <LotteryDetails lottery={currentLottery} />
              <LotteryTimeline lottery={currentLottery} />
            </div>

            {/* Side panel with actions and prize info */}
            <div className="space-y-6">
              <LotteryActions lottery={currentLottery} />
              <LotteryPrizeDistribution lottery={currentLottery} />
            </div>
          </div>

          {/* Participants section */}
          <LotteryParticipants
            lotteryId={currentLottery.id}
            participants={mockParticipants}
            maxParticipants={currentLottery.maxTickets || 0}
            currentParticipants={currentLottery.participants}
          />
        </>
      )}
    </div>
  );
}

const LotteryDetailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="p-6">
          <Skeleton className="h-7 w-32 mb-4" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </Card>
      </div>
    </div>
  );
};
