import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useTranslation } from '@/i18n';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { RiSearchLine, RiSortAsc, RiSortDesc } from 'react-icons/ri';

interface Participant {
  id: string;
  address: string;
  tickets: number;
  joinedAt: string;
  displayName?: string;
  avatarUrl?: string | null;
}

interface LotteryParticipantsProps {
  lotteryId: string;
  participants: Participant[];
  maxParticipants: number;
  currentParticipants: number;
  isLoading?: boolean;
}

export const LotteryParticipants = ({
  lotteryId,
  participants,
  maxParticipants,
  currentParticipants,
  isLoading = false,
}: LotteryParticipantsProps) => {
  const { t } = useTranslation('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'joinedAt' | 'tickets'>(
    'joinedAt',
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 10;

  // Filter and sort participants
  const filteredParticipants = participants.filter((participant) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      participant.displayName?.toLowerCase().includes(query) ||
      participant.address.toLowerCase().includes(query) ||
      participant.id.toLowerCase().includes(query)
    );
  });

  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    if (sortField === 'joinedAt') {
      const dateA = new Date(a.joinedAt).getTime();
      const dateB = new Date(b.joinedAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortDirection === 'asc'
        ? a.tickets - b.tickets
        : b.tickets - a.tickets;
    }
  });

  // Paginate participants
  const paginatedParticipants = sortedParticipants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);

  // Handle sort toggle
  const toggleSort = (field: 'joinedAt' | 'tickets') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4,
    )}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <CardTitle>{t('lotteries.detail.participants.title')}</CardTitle>
            <CardDescription>
              {t('lotteries.detail.participants.description', {
                current: currentParticipants,
                max: maxParticipants || '∞',
              })}
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <RiSearchLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('lotteries.detail.participants.search')}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))}
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery
              ? t('lotteries.detail.participants.noSearchResults')
              : t('lotteries.detail.participants.noParticipants')}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('lotteries.detail.participants.participant')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-primary"
                    onClick={() => toggleSort('joinedAt')}
                  >
                    <div className="flex items-center gap-1">
                      {t('lotteries.detail.participants.joined')}
                      {sortField === 'joinedAt' &&
                        (sortDirection === 'asc' ? (
                          <RiSortAsc className="h-4 w-4" />
                        ) : (
                          <RiSortDesc className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer hover:text-primary"
                    onClick={() => toggleSort('tickets')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {t('lotteries.detail.participants.tickets')}
                      {sortField === 'tickets' &&
                        (sortDirection === 'asc' ? (
                          <RiSortAsc className="h-4 w-4" />
                        ) : (
                          <RiSortDesc className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                          {participant.displayName
                            ? participant.displayName.charAt(0).toUpperCase()
                            : '#'}
                        </div>
                        <div>
                          <div className="font-medium">
                            {participant.displayName ||
                              t('lotteries.detail.participants.anonymous')}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {formatAddress(participant.address)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(participant.joinedAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {participant.tickets}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          currentPage <= 1
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
