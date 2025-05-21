import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { Permission } from '@/types/permission.types';
import { checkEligibility } from '@/store/slices/lotterySlice';
import lotteryService from '@/services/lottery/lotteryService';

const usePermission = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false;

      // Admin has all permissions
      if (user.role === 'ADMIN') return true;

      // Premium users have lottery creation
      if (user.role === 'PREMIUM' && permission === Permission.CREATE_LOTTERY) {
        return true;
      }

      // For regular users, check their explicit permissions
      return user.permissions?.includes(permission) || false;
    },
    [user],
  );

  const checkLotteryCreationEligibility = useCallback(async () => {
    try {
      // Dispatch the Redux action to store the result
      const result = await dispatch(checkEligibility()).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to check eligibility:', error);
      return {
        eligible: false,
        metrics: { ticketsPurchased: 0, amountSpent: 0 },
        threshold: { minTickets: 10, minSpent: 50 },
        progress: 0,
      };
    }
  }, [dispatch]);

  return {
    hasPermission,
    checkLotteryCreationEligibility,
  };
};

export default usePermission;
