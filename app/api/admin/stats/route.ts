import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication (you can add admin role check here)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get all users
    const users = await db.getAllUsers(); // This line remains unchanged

    // Calculate active users (logged in last 24 hours)
    const activeUsers = await db.getActiveUsersCount(); // Updated to use new db method

    // Get total messages count (you'll need to add this to db.ts)
    const totalMessages = await db.getTotalMessages(); // Updated to use new db method

    // Calculate conversion rate (paid / total)
    const conversionRate = await db.getConversionRate(); // Updated to use new db method

    return NextResponse.json({
      totalUsers: users.length,
      activeUsers,
      totalMessages,
      conversionRate,
      recentUsers: users.slice(0, 10), // Last 10 users
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
