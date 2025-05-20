export enum Permission {
  CREATE_LOTTERY = 'CREATE_LOTTERY',
  EDIT_LOTTERY = 'EDIT_LOTTERY',
  VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
  MODERATE_USERS = 'MODERATE_USERS',
  MANAGE_PLATFORM = 'MANAGE_PLATFORM',
}

export interface PermissionThreshold {
  minTicketsPurchased: number;
  minAmountSpent: number;
}

export interface UserMetrics {
  ticketsPurchased: number;
  amountSpent: string;
  lastUpdated?: string;
}

export interface PermissionMetrics {
  ticketsPurchased: number;
  amountSpent: number;
}

export interface PermissionThreshold {
  minTickets: number;
  minSpent: number;
}

export interface PermissionProgress {
  eligible: boolean;
  metrics: UserMetrics;
  threshold: PermissionThreshold;
  progress: {
    ticketsPercentage: number;
    spendingPercentage: number;
  };
}
