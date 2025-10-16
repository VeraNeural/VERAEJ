import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET || 'vera-auto-2025-secret';
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'https://www.veraneural.com'}/api/community/auto-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`
      },
      body: JSON.stringify({ contentType: 'poll' })
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
