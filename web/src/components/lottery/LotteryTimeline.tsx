// src/components/lottery/LotteryTimeline.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lottery } from '@/data/mockLotteries';
import { useTranslation } from '@/i18n';
import { format, isAfter, isBefore, isPast } from 'date-fns';
import { RiArrowRightLine, RiCheckLine, RiTimeLine } from 'react-icons/ri';

interface LotteryTimelineProps {
  lottery: Lottery;
}

export const LotteryTimeline = ({ lottery }: LotteryTimelineProps) => {
  const { t } = useTranslation('dashboard');

  // Format a date and check if it's past
  const formatTimelineDate = (dateString: string | undefined) => {
    if (!dateString) return { formattedDate: 'N/A', isPast: false };

    const date = new Date(dateString);
    return {
      formattedDate: format(date, 'PPP p'), // e.g., "April 29, 2023 at 4:30 PM"
      isPast: isPast(date),
    };
  };

  // Get timeline steps based on lottery state
  const getTimelineSteps = () => {
    const now = new Date();
    const startDate = lottery.startTime
      ? new Date(lottery.startTime)
      : new Date(0);
    const endDate = new Date(lottery.endTime);
    const drawDate = lottery.drawTime
      ? new Date(lottery.drawTime)
      : new Date(lottery.endTime);

    const hasStarted = isPast(startDate);
    const hasEnded = isPast(endDate);
    const hasDrawn = isPast(drawDate);
    const isCancelled = lottery.status === 'cancelled';

    return [
      {
        label: t('lotteries.detail.timeline.created'),
        date: formatTimelineDate(
          lottery.createdAt?.toString() || startDate.toISOString(),
        ),
        status: 'complete',
        isActive: false,
      },
      {
        label: t('lotteries.detail.timeline.ticketSales'),
        date: formatTimelineDate(startDate.toISOString()),
        status: hasStarted ? 'complete' : 'pending',
        isActive: hasStarted && !hasEnded && !isCancelled,
      },
      {
        label: t('lotteries.detail.timeline.salesEnd'),
        date: formatTimelineDate(endDate.toISOString()),
        status: hasEnded ? 'complete' : 'pending',
        isActive: false,
      },
      {
        // src/components/lottery/LotteryTimeline.tsx (continued)
        label: t('lotteries.detail.timeline.salesEnd'),
        date: formatTimelineDate(endDate.toISOString()),
        status: hasEnded ? 'complete' : 'pending',
        isActive: false,
      },
      {
        label: t('lotteries.detail.timeline.drawing'),
        date: formatTimelineDate(drawDate.toISOString()),
        status: hasDrawn ? 'complete' : isCancelled ? 'cancelled' : 'pending',
        isActive: hasEnded && !hasDrawn && !isCancelled,
      },
      {
        label: t('lotteries.detail.timeline.completed'),
        date: {
          formattedDate: hasDrawn
            ? formatTimelineDate(drawDate.toISOString()).formattedDate
            : 'TBD',
          isPast: hasDrawn,
        },
        status: hasDrawn ? 'complete' : isCancelled ? 'cancelled' : 'pending',
        isActive: false,
      },
    ];
  };

  const timelineSteps = getTimelineSteps();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t('lotteries.detail.timeline.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

          {/* Timeline steps */}
          <div className="space-y-6">
            {timelineSteps.map((step, index) => (
              <div key={index} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'complete'
                      ? 'bg-green-100 border-2 border-green-500'
                      : step.status === 'cancelled'
                      ? 'bg-red-100 border-2 border-red-500'
                      : step.isActive
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-muted border-2 border-muted-foreground'
                  }`}
                >
                  {step.status === 'complete' ? (
                    <RiCheckLine className="h-4 w-4 text-green-500" />
                  ) : step.status === 'cancelled' ? (
                    <div className="h-1 w-4 bg-red-500 rounded" />
                  ) : step.isActive ? (
                    <RiTimeLine className="h-4 w-4 text-blue-500 animate-pulse" />
                  ) : (
                    <RiArrowRightLine className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Step content */}
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="font-medium">{step.label}</h3>
                    {step.isActive && (
                      <Badge className="ml-2 bg-blue-500">
                        {t('lotteries.detail.timeline.current')}
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      step.date.isPast ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {step.date.formattedDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
