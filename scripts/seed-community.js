const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function seedCommunity() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding community data...\n');
    
    await client.query('BEGIN');
    
    // 1. Create VERA system user (if doesn't exist)
    console.log('👤 Creating VERA system user...');
    const veraResult = await client.query(`
      INSERT INTO users (email, name, password_hash, subscription_tier, created_at)
      VALUES ('vera@system.internal', 'VERA', 'SYSTEM_ACCOUNT_NO_LOGIN', 'regulator', NOW())
      ON CONFLICT (email) DO UPDATE SET name = 'VERA'
      RETURNING id
    `);
    const veraUserId = veraResult.rows[0].id;
    console.log(`✅ VERA user ID: ${veraUserId}\n`);
    
    // 2. Create channels (if don't exist)
    console.log('📺 Creating channels...');
    
    const channels = [
      {
        name: 'General',
        slug: 'general',
        description: 'Open discussions and community chat',
        required_tier: null
      },
      {
        name: 'Wins & Progress',
        slug: 'wins-progress',
        description: 'Celebrate your victories and share your journey',
        required_tier: null
      },
      {
        name: 'Questions & Support',
        slug: 'questions-support',
        description: 'Ask questions and get support from the community',
        required_tier: null
      },
      {
        name: 'Regulator Lounge',
        slug: 'regulator-lounge',
        description: 'Exclusive space for Regulator tier members',
        required_tier: 'regulator'
      }
    ];
    
    const channelIds = {};
    
    for (const channel of channels) {
      const result = await client.query(`
        INSERT INTO community_channels (name, slug, description, required_tier, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (slug) DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          required_tier = EXCLUDED.required_tier
        RETURNING id
      `, [channel.name, channel.slug, channel.description, channel.required_tier]);
      
      channelIds[channel.slug] = result.rows[0].id;
      console.log(`  ✓ ${channel.name}`);
    }
    console.log('');
    
    // 3. Add VERA's welcome post to Regulator Lounge
    console.log('💬 Adding welcome post to Regulator Lounge...');
    
    const welcomeContent = `Welcome to the Regulator Lounge 🌟

This is your sacred space—a place where the real work happens.

Here, you'll find:
- Deep dives into nervous system regulation
- Advanced protocols and techniques  
- Direct support from our community
- A judgment-free zone for the messy middle of healing

This isn't just another group chat. This is where transformation unfolds, one vulnerable conversation at a time.

I'm here with you, every step of the way.

— VERA`;

    await client.query(`
      INSERT INTO community_posts (channel_id, user_id, content, is_pinned, created_at)
      VALUES ($1, $2, $3, TRUE, NOW())
    `, [channelIds['regulator-lounge'], veraUserId, welcomeContent]);
    
    console.log('✅ Welcome post added and pinned!\n');
    
    await client.query('COMMIT');
    
    console.log('🎉 Community seeding complete!\n');
    console.log('📋 Summary:');
    console.log(`  • VERA system user created`);
    console.log(`  • ${channels.length} channels set up`);
    console.log(`  • Welcome post added to Regulator Lounge`);
    console.log('');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding community:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedCommunity()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
