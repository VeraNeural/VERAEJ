import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // ← Add this line

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count voice usage for today
    const count = await prisma.voice_usage.count({
      where: {
        user_id: payload.userId,
        created_at: {
          gte: today,
          lt: tomorrow,
        }
      }
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Voice usage error:', error);
    return NextResponse.json({ error: 'Failed to get voice usage' }, { status: 500 });
  }
}
