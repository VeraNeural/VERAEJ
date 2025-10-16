import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Call the auto-generate endpoint
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

    return NextResponse.json({
      success: response.ok,
      data,
      message: 'Test completed - check General channel for VERA\'s post'
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
