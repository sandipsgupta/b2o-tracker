import mysql from 'mysql2/promise';

try {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await connection.execute('SELECT id, userId, date, status FROM attendance_records ORDER BY date DESC LIMIT 20');
  console.log('Total records:', rows.length);
  rows.forEach(r => console.log(`  ${r.date}: ${r.status} (user ${r.userId})`));
  await connection.end();
} catch (err) {
  console.error('Error:', err.message);
}
