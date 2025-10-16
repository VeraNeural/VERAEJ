const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

const communityTables = `
-- Community channels table
CREATE TABLE IF NOT EXISTS community_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  required_tier VARCHAR(50), -- null = everyone, 'regulator' = regulator only
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Community messages (DMs between users)
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR(255) NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_channels_slug ON community_channels(slug);
CREATE INDEX IF NOT EXISTS idx_community_posts_channel ON community_posts(channel_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON community_posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_community_messages_conversation ON community_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_sender ON community_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_recipient ON community_messages(recipient_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_community_channels_updated_at ON community_channels;
CREATE TRIGGER update_community_channels_updated_at BEFORE UPDATE ON community_channels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function createTables() {
  try {
    console.log('📊 Creating community tables...\n');
    
    await pool.query(communityTables);
    
    console.log('✅ Community tables created successfully!\n');
    
    // Verify tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'community%'
      ORDER BY table_name
    `);
    
    console.log('📋 Community tables:');
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
