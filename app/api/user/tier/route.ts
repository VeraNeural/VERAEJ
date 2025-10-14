




import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const tier = await db.getUserTier(payload.userId);

    return NextResponse.json({ 
      tier,
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error('Get tier error:', error);
    return NextResponse.json({ 
      error: 'Failed to get user tier' 
    }, { status: 500 });
  }
}
