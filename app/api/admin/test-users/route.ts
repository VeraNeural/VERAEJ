import { NextRequest, NextResponse } from 'next/server';
import { createTestUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Create test user in DB
    const result = await createTestUser({ name, email, password });
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create test user' }, { status: 500 });
  }
}
