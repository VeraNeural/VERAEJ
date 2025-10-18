export type UserTier = 'free' | 'explorer' | 'regulator' | 'integrator' | 'test';

// Define tier hierarchy (higher number = more access)
const TIER_LEVELS: Record<UserTier, number> = {
  free: 0,
  explorer: 1,
  regulator: 2,
  integrator: 3,
  test: 99, // Admin access to everything
};

// Define what each tier includes
export const TIER_FEATURES = {
  voice_responses: ['regulator', 'integrator', 'test'],
  community_access: ['regulator', 'integrator', 'test'],
  unlimited_voice: ['integrator', 'test'],
  course_generation: ['integrator', 'test'],
  advanced_courses: ['regulator', 'integrator', 'test'],
  basic_courses: ['explorer', 'regulator', 'integrator', 'test'],
  wellness_hub: ['explorer', 'regulator', 'integrator', 'test'],
  direct_messages: ['regulator', 'integrator', 'test'],
};

// Check if user tier has access to a feature
export function hasFeatureAccess(
  userTier: UserTier, 
  feature: keyof typeof TIER_FEATURES
): boolean {
  return TIER_FEATURES[feature].includes(userTier);
}

// Check if user tier is at least a certain level
export function hasMinimumTier(
  userTier: UserTier, 
  minimumTier: UserTier
): boolean {
  return TIER_LEVELS[userTier] >= TIER_LEVELS[minimumTier];
}

// Get tier display name
export function getTierDisplayName(tier: UserTier): string {
  const names: Record<UserTier, string> = {
    free: 'Free',
    explorer: 'Explorer',
    regulator: 'Regulator',
    integrator: 'Integrator',
    test: 'Admin',
  };
  return names[tier];
}

// Voice limits by tier
export function getVoiceLimit(tier: UserTier): number {
  if (tier === 'integrator' || tier === 'test') return Infinity;
  if (tier === 'regulator') return 20;
  return 0;
}
