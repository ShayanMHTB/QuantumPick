// src/lib/lottery/validationUtils.ts
import { getUserData } from '@/lib/auth';

export const validateLotteryForm = (
  formData: any,
  constraintErrors: string[],
) => {
  // Check if user is admin
  const currentUser = getUserData();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Check basic validation
  if (!formData.name) {
    return { isValid: false, error: 'Lottery name is required', isAdmin };
  }

  // Check template constraints
  if (constraintErrors.length > 0) {
    return { isValid: false, error: 'Template constraints not met', isAdmin };
  }

  // Check prize distribution
  const prizeSum =
    formData.prizeDistribution.first +
    formData.prizeDistribution.second +
    formData.prizeDistribution.third;

  if (prizeSum !== 100) {
    return {
      isValid: false,
      error: `Prize distribution must total 100% (currently ${prizeSum}%)`,
      isAdmin,
    };
  }

  // Check time sequence
  if (new Date(formData.endTime) >= new Date(formData.drawTime)) {
    return {
      isValid: false,
      error: 'Draw time must be after end time',
      isAdmin,
    };
  }

  // All validation passed
  return { isValid: true, isAdmin };
};
