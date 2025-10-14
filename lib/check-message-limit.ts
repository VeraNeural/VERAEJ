import { db } from './db';
import { getTierLimits } from './tier-limits';

export async function checkMessageLimit(userId: string): Promise<{
  allowed: boolean;
  messagesUsed: number;
  messagesLimit: number;
  tier: string;
  needsUpgrade: boolean;
}> {
  // Get user's tier
  const tier = await db.getUserTier(userId);
  const limits = getTierLimits(tier);

  // Get message count today
  const messagesUsed = await db.countMessagesToday(userId);

  // Check if limit reached
  const allowed = messagesUsed < limits.messagesPerDay;

  return {
    allowed,
    messagesUsed,
    messagesLimit: limits.messagesPerDay,
    tier,
    needsUpgrade: !allowed,
  };
}