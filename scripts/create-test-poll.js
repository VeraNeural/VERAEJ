const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function createTestPoll() {
  const client = await pool.connect();
  
  try {
    console.log('📊 Creating test poll...\n');
    
    await client.query('BEGIN');
    
    // Get VERA's user ID
    const veraResult = await client.query(
      "SELECT id FROM users WHERE email = 'vera@system.internal'"
    );
    
    if (veraResult.rows.length === 0) {
      throw new Error('VERA user not found. Run seed-community.js first.');
    }
    
    const veraUserId = veraResult.rows[0].id;
    
    // Get General channel ID
    const channelResult = await client.query(
      "SELECT id FROM community_channels WHERE slug = 'general'"
    );
    
    if (channelResult.rows.length === 0) {
      throw new Error('General channel not found.');
    }
    
    const channelId = channelResult.rows[0].id;
    
    // Create a post for the poll
    const postResult = await client.query(
      `INSERT INTO community_posts (channel_id, user_id, content, post_type, created_at)
       VALUES ($1, $2, $3, 'poll', NOW())
       RETURNING id`,
      [channelId, veraUserId, 'Weekly Community Check-in Poll']
    );
    
    const postId = postResult.rows[0].id;
    console.log(`✅ Post created: ${postId}\n`);
    
    // Create the poll
    const pollOptions = [
      { id: 'option1', text: 'Feeling regulated and grounded 🌿' },
      { id: 'option2', text: 'Managing well, some ups and downs 🌊' },
      { id: 'option3', text: 'Struggling but showing up 💪' },
      { id: 'option4', text: 'Having a tough time, need support 🤝' }
    ];
    
    const pollResult = await client.query(
      `INSERT INTO polls (post_id, question, options, closes_at, created_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days', NOW())
       RETURNING id`,
      [
        postId,
        'How are you feeling this week?',
        JSON.stringify(pollOptions)
      ]
    );
    
    const pollId = pollResult.rows[0].id;
    console.log(`✅ Poll created: ${pollId}\n`);
    
    await client.query('COMMIT');
    
    console.log('🎉 Test poll created successfully!\n');
    console.log('📋 Details:');
    console.log(`  • Channel: General`);
    console.log(`  • Posted by: VERA`);
    console.log(`  • Question: How are you feeling this week?`);
    console.log(`  • Options: 4`);
    console.log(`  • Closes: in 7 days`);
    console.log('\nGo check it out in the community! 🚀\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating test poll:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createTestPoll()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
