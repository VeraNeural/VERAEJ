const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function listUsers() {
  try {
    const result = await pool.query('SELECT email, name, created_at FROM users ORDER BY created_at DESC');
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log('📋 Users in database:\n');
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Joined: ${new Date(user.created_at).toLocaleDateString()}\n`);
      });
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

listUsers();
