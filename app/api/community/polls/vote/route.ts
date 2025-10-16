import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { pollId, optionId } = await request.json();
    
    console.log('Vote attempt:', { pollId, optionId, userId: user.userId }); // Debug log

    if (!pollId || !optionId) {
      return NextResponse.json(
        { error: 'Poll ID and option ID required' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await query(
      'SELECT id FROM poll_votes WHERE poll_id = $1 AND user_id = $2',
      [pollId, user.userId]
    );

    if (existingVote.rows.length > 0) {
      return NextResponse.json(
        { error: 'You have already voted in this poll' },
        { status: 400 }
      );
    }

    // Record the vote
    await query(
      'INSERT INTO poll_votes (poll_id, user_id, option_id) VALUES ($1, $2, $3)',
      [pollId, user.userId, optionId]
    );

    // Get updated results
    const results = await query(
      `SELECT option_id, COUNT(*) as votes
       FROM poll_votes
       WHERE poll_id = $1
       GROUP BY option_id`,
      [pollId]
    );

    return NextResponse.json({
      success: true,
      results: results.rows,
    });
  } catch (error) {
    console.error('Error voting - Full details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { 
        error: 'Failed to record vote',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
