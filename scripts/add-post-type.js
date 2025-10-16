const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function addPostType() {
  try {
    console.log('📊 Adding post_type column...\n');
    
    await pool.query(`
      ALTER TABLE community_posts 
      ADD COLUMN IF NOT EXISTS post_type VARCHAR(50) DEFAULT 'text';
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

addPostType();
