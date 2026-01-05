import type { DailyImageLimit } from '@/store/smartyStore';

export const getTodayAt1AM = (currentTime: number = Date.now()): number => {
  const today = new Date(currentTime);
  today.setHours(1, 0, 0, 0);
  return today.getTime();
};

export const getNextReset = (currentTime: number = Date.now()): number => {
  const tomorrow = new Date(currentTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(1, 0, 0, 0);
  return tomorrow.getTime();
};

export const checkCanReadImage = (
  dailyLimit: DailyImageLimit,
  currentTime: number = Date.now()
): { allowed: boolean; remaining: number; nextResetTime: number } => {
  const today1AM = getTodayAt1AM(currentTime);

  if (currentTime > today1AM && dailyLimit.lastReset < today1AM) {
    return {
      allowed: true,
      remaining: dailyLimit.limit - 1,
      nextResetTime: getNextReset(currentTime),
    };
  }

  if (dailyLimit.used >= dailyLimit.limit) {
    return {
      allowed: false,
      remaining: 0,
      nextResetTime: getNextReset(currentTime),
    };
  }

  return {
    allowed: true,
    remaining: dailyLimit.limit - dailyLimit.used - 1,
    nextResetTime: getNextReset(currentTime),
  };
};

export const formatNextResetTime = (nextResetTime: number): string => {
  const now = Date.now();
  const diff = nextResetTime - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
