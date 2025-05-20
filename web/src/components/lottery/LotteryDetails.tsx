import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Lottery } from '@/data/mockLotteries';
import { useTranslation } from '@/i18n';
import { LotteryStatusBadge } from './LotteryStatusBadge';
import {
  RiCalendarLine,
  RiTicket2Line,
  RiMoneyDollarCircleLine,
  RiInformationLine,
  RiFileCopyLine,
  RiExternalLinkLine,
} from 'react-icons/ri';
import { Button } from '../ui/button';
import { formatDistanceToNow, format } from 'date-fns';

interface LotteryDetailsProps {
  lottery: Lottery;
}

export const LotteryDetails = ({ lottery }: LotteryDetailsProps) => {
  const { t } = useTranslation('dashboard');

  // Format dates in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP p'); // e.g., "April 29, 2023 at 4:30 PM"
  };

  // Get chain explorer URL based on chainId
  const getChainExplorerUrl = (chainId: number, address: string) => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return `https://etherscan.io/address/${address}`;
      case 56: // BSC
        return `https://bscscan.com/address/${address}`;
      case 137: // Polygon
        return `https://polygonscan.com/address/${address}`;
      case 1337: // Local development
        return `#`;
      default:
        return `#`;
    }
  };

  // Get chain name based on chainId
  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 56:
        return 'BSC';
      case 137:
        return 'Polygon';
      case 1337:
        return 'Local';
      default:
        return `Chain ${chainId}`;
    }
  };

  // Calculate progress percentage for tickets sold
  const ticketSoldPercentage = lottery.maxTickets
    ? Math.min(100, (lottery.ticketsSold / lottery.maxTickets) * 100)
    : 0;

  // Copy contract address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Would add a toast notification here in a real app
    console.log('Copied to clipboard');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">{lottery.title}</CardTitle>
            <CardDescription>{lottery.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <LotteryStatusBadge status={lottery.status} />
            <Badge variant="outline" className="flex items-center gap-1">
              <RiTicket2Line className="h-3 w-3" />
              {lottery.type.charAt(0).toUpperCase() + lottery.type.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            {/* Key lottery details */}
            <div>
              <h3 className="text-sm text-muted-foreground font-medium mb-1">
                {t('lotteries.detail.prize')}
              </h3>
              <p className="text-2xl font-bold">{lottery.prize}</p>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground font-medium mb-1">
                {t('lotteries.detail.ticketPrice')}
              </h3>
              <p className="text-lg">{lottery.ticketPrice} USDC</p>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground font-medium mb-1">
                {t('lotteries.detail.participants')}
              </h3>
              <p className="text-lg">{lottery.participants}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Dates */}
            <div>
              <h3 className="text-sm text-muted-foreground font-medium mb-1">
                {t('lotteries.detail.dates')}
              </h3>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center text-sm">
                  <RiCalendarLine className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">
                    {t('lotteries.detail.startDate')}:
                  </span>
                  <span>
                    {formatDate(lottery.startTime || new Date().toISOString())}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <RiCalendarLine className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">
                    {t('lotteries.detail.endDate')}:
                  </span>
                  <span>{formatDate(lottery.endTime)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <RiCalendarLine className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">
                    {t('lotteries.detail.drawDate')}:
                  </span>
                  <span>{formatDate(lottery.drawTime || lottery.endTime)}</span>
                </div>
              </div>
            </div>

            {/* Blockchain info */}
            <div>
              <h3 className="text-sm text-muted-foreground font-medium mb-1">
                {t('lotteries.detail.blockchain')}
              </h3>
              <div className="flex items-center mb-1">
                <span className="text-muted-foreground mr-2">
                  {t('lotteries.detail.network')}:
                </span>
                <Badge variant="outline">{getChainName(lottery.chainId)}</Badge>
              </div>
              {lottery.contractAddress && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-muted-foreground mr-2">
                    {t('lotteries.detail.contract')}:
                  </span>
                  <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                    {lottery.contractAddress.substring(0, 6)}...
                    {lottery.contractAddress.substring(
                      lottery.contractAddress.length - 4,
                    )}
                  </code>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            copyToClipboard(lottery.contractAddress!)
                          }
                        >
                          <RiFileCopyLine className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('common.copy')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            window.open(
                              getChainExplorerUrl(
                                lottery.chainId,
                                lottery.contractAddress!,
                              ),
                              '_blank',
                            )
                          }
                        >
                          <RiExternalLinkLine className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('lotteries.detail.viewOnExplorer')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ticket progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {t('lotteries.detail.ticketsSold', {
                sold: lottery.ticketsSold,
                total: lottery.maxTickets || '∞',
              })}
            </span>
            {lottery.maxTickets && (
              <span>{Math.round(ticketSoldPercentage)}%</span>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${ticketSoldPercentage}%` }}
            ></div>
          </div>
          {lottery.minTickets && lottery.ticketsSold < lottery.minTickets && (
            <div className="flex items-center text-sm text-amber-500 gap-1">
              <RiInformationLine className="h-4 w-4" />
              <span>
                {t('lotteries.detail.minTicketsRequired', {
                  current: lottery.ticketsSold,
                  min: lottery.minTickets,
                  remaining: lottery.minTickets - lottery.ticketsSold,
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
