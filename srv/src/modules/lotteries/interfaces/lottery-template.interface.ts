export interface LotteryTemplateInterface {
  id: 'basic' | 'medium' | 'mega';
  name: string;
  prizeRange: { min: number; max: number }; // in USD
  ticketPrice: { min: number; max: number }; // in USD
  entryFeePercent: number; // platform fee on ticket
  creationFee: { flat?: number; percentOfPrize?: number }; // either flat or % based
  duration: { minDays: number; maxDays: number };
  minParticipants: number;
  maxWinners: number;
  minWinners: number;
  surplusSplit: { platform: number; creator: number }; // percent
  eligibility: { minTickets: number; minSpent: number };
}
