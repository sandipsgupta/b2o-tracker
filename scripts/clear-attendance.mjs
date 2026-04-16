import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // Get all users
  const [users] = await connection.query('SELECT id FROM users');
  
  // Delete all attendance records
  const [result] = await connection.query('DELETE FROM attendance_records');
  
  console.log(`✅ Cleared ${result.affectedRows} attendance records from the database`);
  console.log('You can now re-mark your office days with the corrected timezone logic');
} catch (error) {
  console.error('❌ Error clearing records:', error.message);
} finally {
  await connection.end();
}
