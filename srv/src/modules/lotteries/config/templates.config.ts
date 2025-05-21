import { LotteryTemplateInterface } from '../interfaces/lottery-template.interface';

/**
 * Fixed lottery templates with predefined rules and constraints
 */
export const lotteryTemplates: Record<string, LotteryTemplateInterface> = {
  basic: {
    id: 'basic',
    name: 'Basic Lottery',
    prizeRange: { min: 2500, max: 5000 },
    ticketPrice: { min: 2, max: 5 },
    entryFeePercent: 10,
    creationFee: { flat: 100 },
    duration: { minDays: 7, maxDays: 14 },
    minParticipants: 500,
    minWinners: 1,
    maxWinners: 1,
    surplusSplit: { platform: 60, creator: 40 },
    eligibility: { minTickets: 10, minSpent: 50 },
  },
  medium: {
    id: 'medium',
    name: 'Medium Lottery',
    prizeRange: { min: 5000, max: 25000 },
    ticketPrice: { min: 5, max: 10 },
    entryFeePercent: 10,
    creationFee: { percentOfPrize: 10 },
    duration: { minDays: 14, maxDays: 21 },
    minParticipants: 1000,
    minWinners: 1,
    maxWinners: 3,
    surplusSplit: { platform: 60, creator: 40 },
    eligibility: { minTickets: 10, minSpent: 50 },
  },
  mega: {
    id: 'mega',
    name: 'Mega Jackpot',
    prizeRange: { min: 25000, max: 1000000 },
    ticketPrice: { min: 10, max: 20 },
    entryFeePercent: 10,
    creationFee: { percentOfPrize: 10 },
    duration: { minDays: 21, maxDays: 30 },
    minParticipants: 2500,
    minWinners: 1,
    maxWinners: 10,
    surplusSplit: { platform: 60, creator: 40 },
    eligibility: { minTickets: 10, minSpent: 50 },
  },
};
