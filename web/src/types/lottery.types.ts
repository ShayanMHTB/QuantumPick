export interface LotteryTemplate {
  id: 'basic' | 'medium' | 'mega';
  name: string;
  prizeRange: { min: number; max: number };
  ticketPrice: { min: number; max: number };
  entryFeePercent: number;
  creationFee: { flat?: number; percentOfPrize?: number };
  duration: { minDays: number; maxDays: number };
  minParticipants: number;
  maxWinners: number;
  minWinners: number;
  surplusSplit: { platform: number; creator: number };
  eligibility: { minTickets: number; minSpent: number };
}
