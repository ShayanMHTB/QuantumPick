'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/i18n';
import { useEffect, useState } from 'react';
import {
  RiClipboardLine,
  RiCoinLine,
  RiEyeLine,
  RiFilterLine,
  RiGamepadLine,
  RiGiftLine,
  RiMoreLine,
  RiPulseLine,
  RiQrCodeLine,
  RiRefund2Line,
  RiSearchLine,
  RiShoppingBag3Line,
  RiTicket2Line,
} from 'react-icons/ri';

// Mock ticket data
const MOCK_TICKETS = [
  {
    id: 'T-1234',
    lotteryId: '1',
    lotteryName: 'Weekly Jackpot',
    lotteryStatus: 'active',
    purchaseDate: '2024-05-25T12:30:00Z',
    price: '$2',
    status: 'active', // active, used, expired, refunded, won
    result: null, // won, lost, pending
    prize: null,
  },
  {
    id: 'T-2345',
    lotteryId: '2',
    lotteryName: 'Mega Prize Draw',
    lotteryStatus: 'active',
    purchaseDate: '2024-05-26T15:45:00Z',
    price: '$5',
    status: 'active',
    result: null,
    prize: null,
  },
  {
    id: 'T-3456',
    lotteryId: '3',
    lotteryName: 'Flash Raffle',
    lotteryStatus: 'completed',
    purchaseDate: '2024-05-20T09:15:00Z',
    price: '$1',
    status: 'used',
    result: 'won',
    prize: '$200',
  },
  {
    id: 'T-4567',
    lotteryId: '4',
    lotteryName: 'Monthly Bonanza',
    lotteryStatus: 'active',
    purchaseDate: '2024-05-28T14:30:00Z',
    price: '$3',
    status: 'active',
    result: null,
    prize: null,
  },
  {
    id: 'T-5678',
    lotteryId: '6',
    lotteryName: 'Quick Draw',
    lotteryStatus: 'completed',
    purchaseDate: '2024-05-10T11:00:00Z',
    price: '$1',
    status: 'used',
    result: 'lost',
    prize: null,
  },
  {
    id: 'T-6789',
    lotteryId: '7',
    lotteryName: 'Special Edition',
    lotteryStatus: 'completed',
    purchaseDate: '2024-05-05T16:20:00Z',
    price: '$3',
    status: 'expired',
    result: null,
    prize: null,
  },
  {
    id: 'T-7890',
    lotteryId: '2',
    lotteryName: 'Mega Prize Draw',
    lotteryStatus: 'active',
    purchaseDate: '2024-05-27T10:45:00Z',
    price: '$5',
    status: 'active',
    result: null,
    prize: null,
  },
  {
    id: 'T-8901',
    lotteryId: '1',
    lotteryName: 'Weekly Jackpot',
    lotteryStatus: 'active',
    purchaseDate: '2024-05-27T12:35:00Z',
    price: '$2',
    status: 'active',
    result: null,
    prize: null,
  },
];

// Status badge components
const TicketStatusBadge = ({
  status,
  result,
}: {
  status: string;
  result: string | null;
}) => {
  if (result === 'won') {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        <RiGiftLine className="mr-1 h-3 w-3" />
        Won
      </Badge>
    );
  }

  switch (status) {
    case 'active':
      return (
        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
          <RiPulseLine className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case 'used':
      return (
        <Badge
          variant="outline"
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300"
        >
          Used
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-500">
          Expired
        </Badge>
      );
    case 'refunded':
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          <RiRefund2Line className="mr-1 h-3 w-3" />
          Refunded
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function TicketsPage() {
  const { t } = useTranslation('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState<typeof MOCK_TICKETS>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setTickets(MOCK_TICKETS);
      setIsLoading(false);
    }, 1500);
  }, []);

  // Filter tickets based on tab and search
  const filteredTickets = tickets.filter((ticket) => {
    // Filter by tab
    if (activeTab === 'active' && ticket.status !== 'active') return false;
    if (activeTab === 'used' && ticket.status !== 'used') return false;
    if (activeTab === 'won' && ticket.result !== 'won') return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.id.toLowerCase().includes(query) ||
        ticket.lotteryName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Format date function
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('tickets.title')}
          </h2>
          <p className="text-muted-foreground">{t('tickets.description')}</p>
        </div>
        <Button className="md:self-start">
          <RiShoppingBag3Line className="mr-2 h-4 w-4" />
          {t('tickets.participateInLottery', 'Participate In A Lottery')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{t('tickets.tabs.all')}</TabsTrigger>
            <TabsTrigger value="active">{t('tickets.tabs.active')}</TabsTrigger>
            <TabsTrigger value="used">{t('tickets.tabs.used')}</TabsTrigger>
            <TabsTrigger value="won">{t('tickets.tabs.won')}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full space-x-2 md:w-auto md:max-w-sm">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('tickets.search')}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <RiFilterLine className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Total stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tickets.stats.total')}
            </CardTitle>
            <RiTicket2Line className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{tickets.length}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tickets.stats.active')}
            </CardTitle>
            <RiPulseLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {tickets.filter((ticket) => ticket.status === 'active').length}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tickets.stats.won')}
            </CardTitle>
            <RiGiftLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {tickets.filter((ticket) => ticket.result === 'won').length}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('tickets.stats.spent')}
            </CardTitle>
            <RiCoinLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {`$${tickets.reduce((total, ticket) => {
                  const price = parseFloat(ticket.price.replace('$', ''));
                  return total + price;
                }, 0)}`}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tickets.table.id')}</TableHead>
                <TableHead>{t('tickets.table.lottery')}</TableHead>
                <TableHead>{t('tickets.table.status')}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t('tickets.table.purchased')}
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  {t('tickets.table.price')}
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  {t('tickets.table.prize')}
                </TableHead>
                <TableHead className="text-right">
                  {t('tickets.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : paginatedTickets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {searchQuery
                      ? t('tickets.noSearchResults')
                      : t('tickets.noTickets')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>{ticket.lotteryName}</TableCell>
                    <TableCell>
                      <TicketStatusBadge
                        status={ticket.status}
                        result={ticket.result}
                      />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(ticket.purchaseDate)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {ticket.price}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {ticket.prize || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <RiMoreLine className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t('tickets.table.actions')}
                          </DropdownMenuLabel>
                          <DropdownMenuItem>
                            <RiEyeLine className="mr-2 h-4 w-4" />
                            {t('tickets.actions.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RiQrCodeLine className="mr-2 h-4 w-4" />
                            {t('tickets.actions.showQR')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RiGamepadLine className="mr-2 h-4 w-4" />
                            {t('tickets.actions.viewLottery')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RiClipboardLine className="mr-2 h-4 w-4" />
                            {t('tickets.actions.copy')}
                          </DropdownMenuItem>
                          {ticket.status === 'active' && (
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                              <RiRefund2Line className="mr-2 h-4 w-4" />
                              {t('tickets.actions.refund')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && filteredTickets.length > 0 && (
        <div className="flex items-center justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage >= totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <RiTicket2Line className="h-12 w-12 text-primary" />
            <div>
              <h3 className="text-lg font-medium mb-1">
                {t('tickets.info.title')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('tickets.info.description')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  {t('tickets.info.viewGuide')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('tickets.info.faq')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
