cat > /home/claude/hospital-api/database/init.js << 'EOF'
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database initialization...');

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons but keep the SQL statements intact
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await client.query(statement);
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists')) {
          console.error('Error executing statement:', err.message);
        }
      }
    }

    // Create super admin with hashed password
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
    
    try {
      await client.query(
        `INSERT INTO users (email, password, role, full_name, is_active)
         VALUES ($1, $2, 'super_admin', 'Super Administrator', true)
         ON CONFLICT (email) DO NOTHING`,
        ['superadmin@hospital.com', hashedPassword]
      );
      console.log('Super Admin created successfully');
    } catch (err) {
      console.log('Super Admin already exists');
    }

    console.log('Database initialization completed successfully!');
    console.log('\nDefault Super Admin Credentials:');
    console.log('Email: superadmin@hospital.com');
    console.log('Password: SuperAdmin@123');
    console.log('\n⚠️  IMPORTANT: Change the super admin password after first login!');

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('\n✅ Initialization complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  });
