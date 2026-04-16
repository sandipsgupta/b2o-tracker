import mysql from 'mysql2/promise';
import { nanoid } from 'nanoid';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'b2o_tracker',
});

async function seedData() {
  console.log('🌱 Seeding B2O Tracker database...');

  try {
    // Create sample users
    const users = [
      {
        openId: `demo-user-${nanoid(8)}`,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        loginMethod: 'manus',
        role: 'user',
        jobRole: 'Software Engineer',
        organization: 'Engineering Team',
      },
      {
        openId: `demo-user-${nanoid(8)}`,
        name: 'Bob Smith',
        email: 'bob@example.com',
        loginMethod: 'manus',
        role: 'user',
        jobRole: 'Product Manager',
        organization: 'Product Team',
      },
    ];

    const userIds = [];

    for (const user of users) {
      const result = await connection.query(
        'INSERT INTO users (openId, name, email, loginMethod, role, jobRole, organization) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.openId, user.name, user.email, user.loginMethod, user.role, user.jobRole, user.organization]
      );
      userIds.push(result[0].insertId);
      console.log(`✓ Created user: ${user.name}`);
    }

    // Create user settings
    for (const userId of userIds) {
      await connection.query(
        'INSERT INTO user_settings (userId, targetPercentage, workingDays) VALUES (?, ?, ?)',
        [userId, 60, '1,2,3,4,5']
      );
    }
    console.log('✓ Created user settings');

    // Create sample attendance records for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const userId of userIds) {
      const records = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getUTCDay();

        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Random attendance: 60% office, 30% WFH, 10% no record
        const random = Math.random();
        let status;
        if (random < 0.6) {
          status = 'office';
        } else if (random < 0.9) {
          status = 'wfh';
        } else {
          continue; // No record
        }

        records.push([userId, dateStr, status]);
      }

      // Insert attendance records
      for (const record of records) {
        await connection.query(
          'INSERT INTO attendance_records (userId, date, status) VALUES (?, ?, ?)',
          record
        );
      }
      console.log(`✓ Created ${records.length} attendance records for user ${userId}`);
    }

    // Create shared dashboard tokens
    for (const userId of userIds) {
      const token = `share_${nanoid(32)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await connection.query(
        'INSERT INTO shared_dashboards (userId, token, expiresAt) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );
      console.log(`✓ Created share link for user ${userId}: /share/${token}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSample users created:');
    console.log('- alice@example.com (60% target)');
    console.log('- bob@example.com (60% target)');
    console.log('\nYou can now log in with these accounts to test the application.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedData();
