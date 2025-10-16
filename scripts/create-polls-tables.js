const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

const pollsTables = `
-- Polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of poll options: [{"id": "opt1", "text": "Option 1"}, ...]
  closes_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(poll_id, user_id) -- One vote per user per poll
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_post ON polls(post_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON poll_votes(user_id);
`;

async function createTables() {
  try {
    console.log('📊 Creating polls tables...\n');
    
    await pool.query(pollsTables);
    
    console.log('✅ Polls tables created successfully!\n');
    
    // Verify tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'poll%'
      ORDER BY table_name
    `);
    
    console.log('📋 Poll tables:');
    result.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));
    console.log('');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    await pool.end();
    process.exit(1);
  }
}

createTables();
