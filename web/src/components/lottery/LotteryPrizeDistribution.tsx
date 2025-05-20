// src/components/lottery/LotteryPrizeDistribution.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lottery } from '@/data/mockLotteries';
import { useTranslation } from '@/i18n';
import { RiMedalFill, RiMedalLine, RiTrophyLine } from 'react-icons/ri';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { useMemo } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'; // Assuming you have these components from shadcn/ui

interface LotteryPrizeDistributionProps {
  lottery: Lottery;
}

export const LotteryPrizeDistribution = ({
  lottery,
}: LotteryPrizeDistributionProps) => {
  const { t } = useTranslation('dashboard');

  // Extract prize distribution from lottery
  const distribution = lottery.prizeDistribution || {
    first: 70,
    second: 20,
    third: 10,
  };

  // Calculate prize amounts
  const prizePool = extractPrizeAmount(lottery.prize);
  const firstPrize = ((prizePool * distribution.first) / 100).toFixed(2);
  const secondPrize = ((prizePool * distribution.second) / 100).toFixed(2);
  const thirdPrize = ((prizePool * distribution.third) / 100).toFixed(2);

  // Colors for the pie chart
  const COLORS = ['#F59E0B', '#9CA3AF', '#B45309'];

  // Helper function to extract numeric prize amount
  function extractPrizeAmount(prizeString: string): number {
    // Remove currency symbol and commas, then parse as float
    const numericString = prizeString.replace(/[$,]/g, '');
    return parseFloat(numericString);
  }

  // Prepare data for pie chart
  const chartData = useMemo(() => {
    const data = [
      { name: 'first', value: distribution.first, fill: COLORS[0] },
    ];

    if (distribution.second > 0) {
      data.push({
        name: 'second',
        value: distribution.second,
        fill: COLORS[1],
      });
    }

    if (distribution.third > 0) {
      data.push({ name: 'third', value: distribution.third, fill: COLORS[2] });
    }

    return data;
  }, [distribution]);

  // Chart configuration for Shadcn chart components
  const chartConfig = {
    prize: {
      label: 'Prize Distribution',
    },
    first: {
      label: t('lotteries.detail.firstPrize'),
      color: COLORS[0],
    },
    second: {
      label: t('lotteries.detail.secondPrize'),
      color: COLORS[1],
    },
    third: {
      label: t('lotteries.detail.thirdPrize'),
      color: COLORS[2],
    },
  };

  // Total for center of donut chart
  const totalPool = useMemo(() => {
    return `$${prizePool.toLocaleString()}`;
  }, [prizePool]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{t('lotteries.detail.prizeDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Prize distribution visualization with pie chart */}
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                strokeWidth={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-bold"
                          >
                            {totalPool}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            {t('lotteries.detail.totalPool')}
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Prize breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <RiTrophyLine className="h-5 w-5 text-yellow-500 mr-2" />
                <span>{t('lotteries.detail.firstPrize')}</span>
              </div>
              <span className="font-medium">${firstPrize}</span>
            </div>

            {distribution.second > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RiMedalFill className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{t('lotteries.detail.secondPrize')}</span>
                </div>
                <span className="font-medium">${secondPrize}</span>
              </div>
            )}

            {distribution.third > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RiMedalLine className="h-5 w-5 text-amber-700 mr-2" />
                  <span>{t('lotteries.detail.thirdPrize')}</span>
                </div>
                <span className="font-medium">${thirdPrize}</span>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {t('lotteries.detail.prizeNote')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
