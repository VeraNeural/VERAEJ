// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string, 
  limit: number = 10, 
  windowMs: number = 60000 // 1 minute
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  // No existing limit or window expired - start new window
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  // Check if limit exceeded
  if (userLimit.count >= limit) {
    return { 
      success: false, 
      remaining: 0, 
      resetTime: userLimit.resetTime 
    };
  }

  // Increment count
  userLimit.count++;
  return { 
    success: true, 
    remaining: limit - userLimit.count, 
    resetTime: userLimit.resetTime 
  };
}

// Helper to get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}
