import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pollId = searchParams.get('pollId');

    if (!pollId) {
      return NextResponse.json({ error: 'Poll ID required' }, { status: 400 });
    }

    // Get poll details
    const pollResult = await query(
      'SELECT * FROM polls WHERE id = $1',
      [pollId]
    );

    if (pollResult.rows.length === 0) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const poll = pollResult.rows[0];

    // Get vote counts
    const votesResult = await query(
      `SELECT option_id, COUNT(*) as votes
       FROM poll_votes
       WHERE poll_id = $1
       GROUP BY option_id`,
      [pollId]
    );

    // Check if user voted
    const userVoteResult = await query(
      'SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2',
      [pollId, user.userId]
    );

    const totalVotes = votesResult.rows.reduce((sum, row) => sum + parseInt(row.votes), 0);

    return NextResponse.json({
      poll,
      votes: votesResult.rows,
      totalVotes,
      userVote: userVoteResult.rows[0]?.option_id || null,
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
