const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function addTierColumn() {
  try {
    console.log('📊 Adding subscription_tier column...\n');
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
      UPDATE users SET subscription_tier = 'free' WHERE subscription_tier IS NULL;
    `);
    
    console.log('✅ Column added successfully!\n');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addTierColumn();
