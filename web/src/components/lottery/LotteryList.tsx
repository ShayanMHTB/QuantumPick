import { Card, CardContent } from '@/components/ui/card';
import { Lottery } from '@/data/mockLotteries';
import { useTranslation } from '@/i18n';
import { useEffect, useState } from 'react';
import { FilterTab, LotteryFilters } from './LotteryFilters';
import { LotteryPagination } from './LotteryPagination';
import { LotteryTable } from './LotteryTable';

interface LotteryListProps {
  lotteries: Lottery[];
  isLoading: boolean;
  currentUserId?: string;
  onAction: (action: 'view' | 'buy' | 'edit' | 'delete', id: string) => void;
}

export const LotteryList = ({
  lotteries: initialLotteries,
  isLoading,
  currentUserId = 'user-123',
  onAction,
}: LotteryListProps) => {
  const { t } = useTranslation('dashboard');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredLotteries, setFilteredLotteries] = useState<Lottery[]>([]);
  const itemsPerPage = 5;

  // Filter lotteries based on tab and search
  useEffect(() => {
    const filtered = initialLotteries.filter((lottery) => {
      // Filter by tab
      if (activeTab === 'created' && lottery.creatorId !== currentUserId)
        return false;
      if (activeTab === 'participated' && lottery.creatorId === currentUserId)
        return false;
      if (activeTab === 'active' && lottery.status !== 'active') return false;
      if (activeTab === 'completed' && lottery.status !== 'completed')
        return false;
      if (activeTab === 'pending' && lottery.status !== 'pending') return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          lottery.title.toLowerCase().includes(query) ||
          lottery.type.toLowerCase().includes(query) ||
          lottery.prize.toLowerCase().includes(query)
        );
      }

      return true;
    });

    setFilteredLotteries(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [initialLotteries, activeTab, searchQuery, currentUserId]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLotteries.length / itemsPerPage);
  const paginatedLotteries = filteredLotteries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenFilterDialog = () => {
    // Advanced filter dialog would be implemented here
    console.log('Open advanced filter dialog');
  };

  return (
    <div className="space-y-6">
      <LotteryFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onOpenFilterDialog={handleOpenFilterDialog}
      />

      <Card>
        <CardContent className="p-0">
          <LotteryTable
            lotteries={paginatedLotteries}
            isLoading={isLoading}
            currentUserId={currentUserId}
            onAction={onAction}
          />
        </CardContent>
      </Card>

      {!isLoading && filteredLotteries.length > 0 && (
        <LotteryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
