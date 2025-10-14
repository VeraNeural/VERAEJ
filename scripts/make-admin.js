const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node scripts/make-admin.js <email>');
    process.exit(1);
  }

  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    `);

    const result = await pool.query(
      'UPDATE users SET is_admin = TRUE WHERE email = $1 RETURNING *',
      [email]
    );

    if (result.rows.length > 0) {
      console.log(`✅ ${email} is now an admin!`);
    } else {
      console.log(`❌ User ${email} not found`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

makeAdmin();
