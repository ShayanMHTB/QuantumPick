'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Check,
  ChevronRight,
  Clock,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Mock lottery data
const MOCK_LOTTERIES = [
  {
    id: '1',
    title: 'Weekly Mega Jackpot',
    status: 'active',
    type: 'timed',
    network: 'ethereum',
    ticketPrice: '10',
    currency: 'USDC',
    currentPrize: '25,750',
    totalParticipants: 1237,
    endsIn: '2d 14h',
    image: '/globe.svg'
  },
  {
    id: '2',
    title: 'Polygon Community Pool',
    status: 'active',
    type: 'progressive',
    network: 'polygon',
    ticketPrice: '5',
    currency: 'USDC',
    currentPrize: '8,420',
    totalParticipants: 964,
    endsIn: '3d 8h',
    image: '/file.svg'
  },
  {
    id: '3',
    title: 'Crypto Enthusiast Draw',
    status: 'active',
    type: 'fixed',
    network: 'binance',
    ticketPrice: '2',
    currency: 'USDC',
    currentPrize: '10,000',
    totalParticipants: 2451,
    endsIn: '1d 3h',
    image: '/window.svg'
  },
  {
    id: '4',
    title: 'One Million USDC Dream',
    status: 'upcoming',
    type: 'target',
    network: 'ethereum',
    ticketPrice: '100',
    currency: 'USDC',
    currentPrize: '1,000,000',
    totalParticipants: 4127,
    endsIn: 'Fills at 10,000 tickets',
    image: '/globe.svg'
  },
  {
    id: '5',
    title: 'NFT Collector\'s Lottery',
    status: 'active',
    type: 'timed',
    network: 'solana',
    ticketPrice: '20',
    currency: 'USDC',
    currentPrize: '35,750',
    totalParticipants: 873,
    endsIn: '4d 6h',
    image: '/file.svg'
  },
  {
    id: '6',
    title: 'DeFi Builders Fund',
    status: 'upcoming',
    type: 'progressive',
    network: 'tron',
    ticketPrice: '15',
    currency: 'USDC',
    currentPrize: '12,000',
    totalParticipants: 0,
    endsIn: 'Starts in 2d',
    image: '/window.svg'
  },
  {
    id: '7',
    title: 'Quick Win Mini Lottery',
    status: 'active',
    type: 'fixed',
    network: 'polygon',
    ticketPrice: '1',
    currency: 'USDC',
    currentPrize: '2,500',
    totalParticipants: 1845,
    endsIn: '12h 30m',
    image: '/globe.svg'
  },
  {
    id: '8',
    title: 'Grand Annual Jackpot',
    status: 'upcoming',
    type: 'target',
    network: 'ethereum',
    ticketPrice: '50',
    currency: 'USDC',
    currentPrize: '500,000',
    totalParticipants: 3210,
    endsIn: 'Fills at 20,000 tickets',
    image: '/file.svg'
  },
  {
    id: '9',
    title: 'Weekend Special Draw',
    status: 'completed',
    type: 'timed',
    network: 'binance',
    ticketPrice: '5',
    currency: 'USDC',
    currentPrize: '15,000',
    totalParticipants: 2780,
    endsIn: 'Completed',
    winner: '0x7a...f4d2',
    image: '/window.svg'
  }
];

// Network badge component
const NetworkBadge = ({ network }: { network: string }) => {
  const networkColors: Record<string, string> = {
    ethereum: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    polygon: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    binance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    solana: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    tron: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const color = networkColors[network] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

  return (
    <Badge variant="outline" className={`${color} border-transparent capitalize`}>
      {network}
    </Badge>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  };

  const color = statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

  return (
    <Badge className={`${color}`}>
      {status === 'active' && 'Active'}
      {status === 'upcoming' && 'Upcoming'}
      {status === 'completed' && 'Completed'}
    </Badge>
  );
};

// Lottery card component
interface LotteryCardProps {
  lottery: typeof MOCK_LOTTERIES[0];
}

const LotteryCard = ({ lottery }: LotteryCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{lottery.title}</CardTitle>
          <StatusBadge status={lottery.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center mb-4">
          <div className="h-16 w-16 relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 mr-4 flex-shrink-0">
            <Image
              src={lottery.image}
              alt={lottery.title}
              fill
              className="object-cover p-2"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NetworkBadge network={lottery.network} />
              <Badge variant="outline" className="text-xs font-normal capitalize">
                {lottery.type} Lottery
              </Badge>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Wallet className="h-3.5 w-3.5 mr-1" />
              {lottery.ticketPrice} {lottery.currency} per ticket
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> Current Prize:
            </span>
            <span className="font-semibold">{lottery.currency} {lottery.currentPrize}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <Users className="h-3.5 w-3.5 mr-1" /> Participants:
            </span>
            <span>{lottery.totalParticipants.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" /> {lottery.status === 'completed' ? 'Winner:' : 'Ends in:'}
            </span>
            <span>{lottery.status === 'completed' ? lottery.winner : lottery.endsIn}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <Button className="w-full rounded-full" disabled={lottery.status === 'completed'}>
          {lottery.status === 'active' ? 'Buy Tickets' : 
           lottery.status === 'upcoming' ? 'Notify Me' : 'View Details'}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function LotteriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('prize');

  // Filter and sort lotteries
  const filteredLotteries = MOCK_LOTTERIES.filter(lottery => {
    // Search filter
    if (searchQuery && !lottery.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Network filter
    if (networkFilter !== 'all' && lottery.network !== networkFilter) {
      return false;
    }

    // Type filter
    if (typeFilter !== 'all' && lottery.type !== typeFilter) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort by selected option
    if (sortBy === 'prize') {
      return parseInt(b.currentPrize.replace(/,/g, '')) - parseInt(a.currentPrize.replace(/,/g, ''));
    } else if (sortBy === 'participants') {
      return b.totalParticipants - a.totalParticipants;
    } else if (sortBy === 'recent') {
      // This would ideally be based on creation date, but for mock data we'll use ID
      return parseInt(b.id) - parseInt(a.id);
    }
    return 0;
  });

  // Get lotteries by status
  const activeLotteries = filteredLotteries.filter(lottery => lottery.status === 'active');
  const upcomingLotteries = filteredLotteries.filter(lottery => lottery.status === 'upcoming');
  const completedLotteries = filteredLotteries.filter(lottery => lottery.status === 'completed');

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-[60%] -left-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Explore <span className="text-primary">Lotteries</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Browse our selection of transparent Web3 lotteries or create your own custom lottery with just a few clicks.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full">
                Browse Lotteries
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                Create Your Own
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lotteries Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search lotteries..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="w-full md:w-40">
                  <Select value={networkFilter} onValueChange={setNetworkFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Networks</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="binance">Binance</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="tron">Tron</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-40">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="timed">Timed</SelectItem>
                      <SelectItem value="progressive">Progressive</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="target">Target</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-40">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prize">Prize Amount</SelectItem>
                      <SelectItem value="participants">Participants</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredLotteries.length} lotteries found
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <Filter size={16} className="text-gray-400 mr-1" />
                <span className="text-gray-600 dark:text-gray-400">Filters:</span>
                {networkFilter !== 'all' && (
                  <Badge variant="outline" className="capitalize ml-1">
                    {networkFilter}
                  </Badge>
                )}
                {typeFilter !== 'all' && (
                  <Badge variant="outline" className="capitalize ml-1">
                    {typeFilter}
                  </Badge>
                )}
                {(networkFilter !== 'all' || typeFilter !== 'all') && (
                  <Button 
                    variant="ghost" 
                    className="h-7 px-2 text-xs" 
                    onClick={() => {
                      setNetworkFilter('all');
                      setTypeFilter('all');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Lotteries tabs */}
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="active" className="text-sm md:text-base">
                Active ({activeLotteries.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="text-sm md:text-base">
                Upcoming ({upcomingLotteries.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-sm md:text-base">
                Completed ({completedLotteries.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {activeLotteries.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 dark:text-gray-400">No active lotteries found with the selected filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeLotteries.map(lottery => (
                    <LotteryCard key={lottery.id} lottery={lottery} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming">
              {upcomingLotteries.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 dark:text-gray-400">No upcoming lotteries found with the selected filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingLotteries.map(lottery => (
                    <LotteryCard key={lottery.id} lottery={lottery} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedLotteries.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 dark:text-gray-400">No completed lotteries found with the selected filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedLotteries.map(lottery => (
                    <LotteryCard key={lottery.id} lottery={lottery} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Create Your Own Lottery
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Launch your custom Web3 lottery in minutes with our no-code interface. Set your own rules, prize structure, and duration.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Complete transparency', 'Custom parameters', 'Real-time analytics', 'Automatic payouts'].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <div className="mr-2 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="rounded-full">
                  Start Creating
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative h-64 md:h-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-xl flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
