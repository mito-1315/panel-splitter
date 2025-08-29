import supabase, { testConnection } from './database.js';

// Test the database connection
testConnection()
  .then(isConnected => {
    if (isConnected) {
      console.log('✅ Database connection test passed');
    } else {
      console.error('❌ Database connection test failed');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error testing database connection:', error);
    process.exit(1);
  });