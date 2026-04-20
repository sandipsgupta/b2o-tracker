# B2O Tracker - Development Todo

## Phase 1: Design System & Database Schema
- [x] Define color palette and design tokens in index.css
- [x] Configure Tailwind theme with semantic colors
- [x] Design database schema (users, attendance, settings, shared_dashboards)
- [x] Generate and apply database migrations
- [x] Create database query helpers in server/db.ts

## Phase 2: Backend API
- [x] Implement user profile update endpoint
- [x] Implement attendance logging (create/update/delete daily records)
- [x] Implement attendance query helpers (weekly, monthly stats)
- [x] Implement settings management (target %, working days config)
- [x] Implement shared dashboard token generation and retrieval
- [x] Implement report generation helpers (weekly, monthly)
- [x] Implement AI insights generation (LLM-powered)
- [x] Write vitest tests for all backend procedures

## Phase 3: Frontend - Dashboard & UI
- [x] Create DashboardLayout component with sidebar navigation
- [x] Create Home/Dashboard page with layout structure
- [x] Create Calendar component for attendance logging
- [x] Create Weekly Attendance Bar Chart
- [x] Create Monthly Progress Bar
- [x] Create Remaining Days Counter
- [x] Create Weekly Trend Line Chart
- [x] Create Settings page for target % and working days config
- [x] Create ShareLinksManager component
- [x] Create ReportsExport component
- [x] Write vitest tests for frontend components

## Phase 4: AI Layer
- [x] Implement attendance analysis function
- [x] Implement recommendation generation (LLM-powered)
- [x] Implement forecasting logic
- [x] Create AI Insights panel UI component
- [x] Integrate AI insights into dashboard
- [x] Write vitest tests for AI logic

## Phase 5: Public Dashboard & Exports
- [x] Create public dashboard page (read-only, token-based access)
- [x] Implement CSV export for reports
- [x] Implement PDF export for reports (using weasyprint)
- [x] Create share link generation UI
- [x] Test public dashboard access and data privacy (removed personal identifiers)

## Phase 6: Seed Data & Testing
- [x] Create seed data script with sample users and attendance
- [x] Run end-to-end testing of all features
- [x] Test mobile responsiveness
- [x] Verify AI insights generation
- [x] Test public dashboard sharing
- [x] Test CSV exports

## Phase 7: Deployment & Delivery
- [x] Final status check and bug fixes
- [x] Create checkpoint for deployment
- [x] Deploy to production
- [x] Provide live URL and documentation

## Phase 8: Timezone & Calculation Fixes
- [x] Fix timezone consistency for month-long attendance logging
- [x] Audit and fix 60% calculation logic
- [x] Fix increment logic when logging new days
- [x] Ensure accurate working day count regardless of timezone
- [x] Add comprehensive calculation tests

## Phase 9: Holiday & Time-Off Feature
- [x] Add "Holiday" and "Time Off" as status options in calendar
- [x] Update database schema to support new status types
- [x] Modify working day calculation to exclude holidays/time-off
- [x] Update 60% target calculation: 60% of (total working days - holidays - time off)
- [x] Update UI to show adjusted target based on holidays
- [x] Update AI insights to account for holidays
- [x] Write tests for holiday/time-off calculations

## Completed Tasks Summary

### Phase 8: Timezone & Calculation Fixes ✅
- [x] Fix timezone consistency for month-long attendance logging
- [x] Audit and fix 60% calculation logic
- [x] Fix increment logic when logging new days
- [x] Ensure accurate working day count regardless of timezone
- [x] Add comprehensive calculation tests

### Phase 9: Holiday & Time-Off Feature ✅
- [x] Add "Holiday" and "Time Off" as status options in calendar
- [x] Update database schema to support new status types
- [x] Modify working day calculation to exclude holidays/time-off
- [x] Update 60% target calculation: 60% of (total working days - holidays - time off)
- [x] Update UI to show adjusted target based on holidays
- [x] Update AI insights to account for holidays
- [x] Write tests for holiday/time-off calculations


## Phase 10: Debug Attendance Count Inconsistencies
- [x] Calendar shows 8 office days but "This Month" card shows 4 days
- [x] Identify which records are being counted vs skipped
- [x] Fix backend endpoint returning different counts
- [x] Verify "Days remaining" calculation (should be 8, not 4)
- [x] Ensure all endpoints use same attendance counting logic
- [x] Add debug logging to trace record fetching
- [x] Fix critical bug: upsertAttendanceRecord creating duplicates instead of updating
- [x] Test with actual user data to verify fix

## Phase 11: Major Enhancements - Planned Days & Time Tracking
- [x] Fix holiday update bug for past dates (April 1 not updating to Holiday)
- [x] Add Planned Days counter display below "Days remaining"
- [x] Implement time tracking counter (start/stop/auto-end after 8 hours)
- [ ] Add auto-WFH assignment at end of week (Sunday night)
- [ ] Implement browser push notifications with optional phone number in profile
- [ ] Debug and fix WFH graph display issue
- [ ] Test all features in preview mode
- [ ] Save checkpoint for Phase 11 enhancements
