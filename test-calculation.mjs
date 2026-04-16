import { calculateAttendanceStats, getCurrentMonthRange, isWorkingDay } from './shared/attendance.ts';

const monthRange = getCurrentMonthRange();
console.log('Month range:', monthRange);

// Manually count working days
let count = 0;
const [startYear, startMonth, startDay] = monthRange.start.split('-').map(Number);
const [endYear, endMonth, endDay] = monthRange.end.split('-').map(Number);

const start = new Date(startYear, startMonth - 1, startDay);
const end = new Date(endYear, endMonth - 1, endDay);

console.log('Start date:', start.toDateString());
console.log('End date:', end.toDateString());

const current = new Date(start);
while (current <= end) {
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, '0');
  const day = String(current.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  const dayOfWeek = current.getDay();
  const isWorking = dayOfWeek >= 1 && dayOfWeek <= 5;
  if (isWorking) count++;
  
  current.setDate(current.getDate() + 1);
}

console.log('Total working days:', count);
console.log('60% of', count, '=', Math.ceil(count * 0.6), 'days needed');

// Test with empty records
const stats = calculateAttendanceStats([], monthRange, '1,2,3,4,5', 60);
console.log('\nCalculated stats:');
console.log('  totalWorkingDays:', stats.totalWorkingDays);
console.log('  officeAttendedDays:', stats.officeAttendedDays);
console.log('  remainingDaysNeeded:', stats.remainingDaysNeeded);
