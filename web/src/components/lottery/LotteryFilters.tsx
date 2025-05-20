import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/i18n';
import { RiFilterLine, RiSearchLine } from 'react-icons/ri';

export type FilterTab =
  | 'all'
  | 'created'
  | 'participated'
  | 'active'
  | 'completed'
  | 'pending';

interface LotteryFiltersProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFilterDialog?: () => void;
}

export const LotteryFilters = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenFilterDialog,
}: LotteryFiltersProps) => {
  const { t } = useTranslation('dashboard');

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => onTabChange(value as FilterTab)}
        className="w-full md:w-auto"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">{t('lotteries.tabs.all')}</TabsTrigger>
          <TabsTrigger value="created">
            {t('lotteries.tabs.created')}
          </TabsTrigger>
          <TabsTrigger value="participated">
            {t('lotteries.tabs.participated')}
          </TabsTrigger>
          <TabsTrigger value="active">{t('lotteries.tabs.active')}</TabsTrigger>
          <TabsTrigger value="completed">
            {t('lotteries.tabs.completed')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex w-full space-x-2 md:w-auto md:max-w-sm">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('lotteries.search')}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={onOpenFilterDialog}>
          <RiFilterLine className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
