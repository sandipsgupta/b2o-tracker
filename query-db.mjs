import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute('SELECT * FROM attendance_records ORDER BY date DESC LIMIT 20');
console.log('Attendance Records:');
console.log(rows);
await connection.end();
