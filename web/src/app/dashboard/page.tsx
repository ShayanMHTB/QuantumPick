'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '@/hooks/useAuth';
import { useTranslation } from '@/i18n';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  RiArrowRightLine,
  RiArrowUpLine,
  RiCoinLine,
  RiGamepadLine,
  RiTicket2Line,
  RiTrophyLine,
} from 'react-icons/ri';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

// Mock data for charts
const lotteryData = [
  { name: 'Jan', active: 4, completed: 2, participated: 6 },
  { name: 'Feb', active: 3, completed: 4, participated: 7 },
  { name: 'Mar', active: 5, completed: 3, participated: 8 },
  { name: 'Apr', active: 7, completed: 2, participated: 9 },
  { name: 'May', active: 6, completed: 5, participated: 11 },
  { name: 'Jun', active: 8, completed: 4, participated: 12 },
];

const revenueData = [
  { name: 'Jan', revenue: 0, winnings: 0 },
  { name: 'Feb', revenue: 0, winnings: 0 },
  { name: 'Mar', revenue: 25, winnings: 100 },
  { name: 'Apr', revenue: 50, winnings: 200 },
  { name: 'May', revenue: 75, winnings: 0 },
  { name: 'Jun', revenue: 150, winnings: 500 },
];

// Mock recent activities
const recentActivities = [
  {
    id: 1,
    type: 'lottery_created',
    title: 'Weekly Jackpot',
    timestamp: '2024-06-01T14:30:00Z',
    details: { type: 'Standard', prize: '$500', participants: 0 },
  },
  {
    id: 2,
    type: 'ticket_purchased',
    title: 'Mega Prize Draw',
    timestamp: '2024-05-30T09:15:00Z',
    details: { amount: 5, cost: '$10' },
  },
  {
    id: 3,
    type: 'lottery_won',
    title: 'Flash Raffle',
    timestamp: '2024-05-28T18:45:00Z',
    details: { prize: '$200', ticket: 'T-28392' },
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    activeLotteries: 0,
    ticketsOwned: 0,
    totalWinnings: 0,
    totalParticipated: 0,
  });
  const [timeframe, setTimeframe] = useState('6m');

  useEffect(() => {
    // Simulate API call to fetch user stats
    const timer = setTimeout(() => {
      setUserStats({
        activeLotteries: 3,
        ticketsOwned: 12,
        totalWinnings: 800,
        totalParticipated: 15,
      });
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Get current time for greeting
  const getCurrentTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Greeting */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t(`dashboard.greeting.${getCurrentTimeOfDay()}`)}
          {user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h2>
        <p className="text-muted-foreground">
          {t('dashboard.overview.description')}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Lotteries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.activeLotteries')}
              </CardTitle>
              <RiGamepadLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {userStats.activeLotteries}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tickets Owned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.ticketsOwned')}
              </CardTitle>
              <RiTicket2Line className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {userStats.ticketsOwned}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +5 from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Won */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.totalWinnings')}
              </CardTitle>
              <RiTrophyLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    ${userStats.totalWinnings}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 inline-flex items-center">
                      <RiArrowUpLine className="mr-1 h-3 w-3" />
                      20.1%
                    </span>{' '}
                    from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Participated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.totalParticipated')}
              </CardTitle>
              <RiCoinLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {userStats.totalParticipated}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 inline-flex items-center">
                      <RiArrowUpLine className="mr-1 h-3 w-3" />
                      12%
                    </span>{' '}
                    from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Charts */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>{t('dashboard.charts.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.charts.description')}
              </CardDescription>
            </div>
            <Tabs defaultValue="lotteries" className="ml-auto">
              <TabsList className="grid w-[220px] grid-cols-2">
                <TabsTrigger value="lotteries">
                  {t('dashboard.charts.tabs.lotteries')}
                </TabsTrigger>
                <TabsTrigger value="revenue">
                  {t('dashboard.charts.tabs.revenue')}
                </TabsTrigger>
              </TabsList>
              <div className="mt-4">
                <TabsContent value="lotteries" className="h-[350px]">
                  <ChartContainer
                    config={{
                      active: {
                        label: 'Active',
                        color: 'hsl(var(--chart-1))',
                      },
                      completed: {
                        label: 'Completed',
                        color: 'hsl(var(--chart-2))',
                      },
                      participated: {
                        label: 'Participated',
                        color: 'hsl(var(--chart-3))',
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lotteryData} accessibilityLayer>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <YAxis
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Bar
                          dataKey="active"
                          name="Active"
                          stackId="a"
                          fill="var(--color-active)"
                          radius={4}
                        />
                        <Bar
                          dataKey="completed"
                          name="Completed"
                          stackId="a"
                          fill="var(--color-completed)"
                          radius={4}
                        />
                        <Bar
                          dataKey="participated"
                          name="Participated"
                          fill="var(--color-participated)"
                          radius={4}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="revenue" className="h-[350px]">
                  <ChartContainer
                    config={{
                      revenue: {
                        label: 'Revenue',
                        color: 'hsl(var(--chart-1))',
                      },
                      winnings: {
                        label: 'Winnings',
                        color: 'hsl(var(--chart-2))',
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} accessibilityLayer>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <YAxis
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="var(--color-revenue)"
                          fill="var(--color-revenue)"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="winnings"
                          name="Winnings"
                          stroke="var(--color-winnings)"
                          fill="var(--color-winnings)"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </TabsContent>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground pt-4">
              {t('dashboard.charts.timeframes.title')}:
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={timeframe === '7d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('7d')}
                >
                  {t('dashboard.charts.timeframes.7d')}
                </Button>
                <Button
                  variant={timeframe === '1m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('1m')}
                >
                  {t('dashboard.charts.timeframes.1m')}
                </Button>
                <Button
                  variant={timeframe === '6m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('6m')}
                >
                  {t('dashboard.charts.timeframes.6m')}
                </Button>
                <Button
                  variant={timeframe === '1y' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe('1y')}
                >
                  {t('dashboard.charts.timeframes.1y')}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              <RiArrowUpLine className="h-4 w-4 text-green-500" />
              {t('dashboard.charts.trending', { percent: '15.2%' })}
            </div>
            <div className="leading-none text-muted-foreground">
              {t('dashboard.charts.summary')}
            </div>
          </CardFooter>
        </Card>
        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.activity.title')}</CardTitle>
            <CardDescription>
              {t('dashboard.activity.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">
                        {activity.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      {activity.type === 'lottery_created' && (
                        <div className="flex items-center">
                          <RiGamepadLine className="mr-2 h-4 w-4 text-primary" />
                          <span className="text-sm">
                            {t('dashboard.activity.lotteryCreated', {
                              type: activity.details.type,
                              prize: activity.details.prize,
                            })}
                          </span>
                        </div>
                      )}
                      {activity.type === 'ticket_purchased' && (
                        <div className="flex items-center">
                          <RiTicket2Line className="mr-2 h-4 w-4 text-amber-500" />
                          <span className="text-sm">
                            {t('dashboard.activity.ticketPurchased', {
                              amount: activity.details.amount,
                              cost: activity.details.cost,
                            })}
                          </span>
                        </div>
                      )}
                      {activity.type === 'lottery_won' && (
                        <div className="flex items-center">
                          <RiTrophyLine className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">
                            {t('dashboard.activity.lotteryWon', {
                              prize: activity.details.prize,
                              ticket: activity.details.ticket,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <div className="px-6 py-4 border-t">
            <Button variant="outline" className="w-full text-center" size="sm">
              <span className="mr-2">{t('dashboard.activity.viewAll')}</span>
              <RiArrowRightLine className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions.title')}</CardTitle>
          <CardDescription>
            {t('dashboard.quickActions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">
              <RiTicket2Line className="mr-2 h-4 w-4" />
              {t('dashboard.quickActions.buyTickets')}
            </Button>
            <Button variant="outline">
              <RiGamepadLine className="mr-2 h-4 w-4" />
              {t('dashboard.quickActions.createLottery')}
            </Button>
            <Button variant="secondary">
              <RiCoinLine className="mr-2 h-4 w-4" />
              {t('dashboard.quickActions.depositFunds')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
