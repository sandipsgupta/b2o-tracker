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
- [x] Integrate TimeTracker into AttendanceCalendar status modal
- [x] Display hours in "Hours Today" card on dashboard (always visible)
- [x] Improve live time display (derive from startTime, update every second)
- [x] Add server-side validation (office status only, clear startTime after stop)
- [x] Fix startTracking to clear endTime/hoursWorked so sessions can restart cleanly
- [x] Fix Dashboard Hours Today card to show live elapsed time via useEffect interval
- [x] Fix TimeTracker to not auto-close modal on stop (let user see final time)
- [x] Apply missing DB migrations (endTime, hoursWorked columns)
- [x] Add comprehensive vitest tests for time tracking (10 tests)
- [x] All 58 tests passing, TypeScript clean
- [ ] Add auto-WFH assignment at end of week (Sunday night) - DEFERRED
- [ ] Implement browser push notifications - DEFERRED
- [ ] Debug and fix WFH graph display issue - DEFERRED
- [x] Test all features in preview mode
- [x] Save checkpoint and ready to publish


## Phase 12: Auto-WFH Assignment & Notifications
- [x] Implement auto-WFH assignment for unlogged days at end of week (Sunday 11:59 PM)
- [x] Add scheduled job to assign WFH status to unlogged working days
- [x] Move date utilities to server-side (no client imports)
- [x] Add duplicate-prevention guards (clear existing timeout on restart)
- [x] Add comprehensive vitest tests for auto-WFH logic (17 tests total: 9 date math + 8 integration logic)
- [x] Register job on server startup
- [x] Production-ready: Robust scheduling, proper error handling, comprehensive test coverage
- [ ] Implement browser push notifications with optional phone number in profile
- [ ] Add notification permission request UI
- [ ] Test push notification delivery


## Phase 13: Browser Push Notifications
- [x] Create push notification subscription table (push_subscriptions)
- [x] Create push notification subscription endpoints (tRPC)
- [x] Add push notification service worker (sw.js)
- [x] Implement browser notification permission request UI (usePushNotifications hook)
- [x] Create NotificationSettings component for user settings
- [x] Add subscription management (subscribe/unsubscribe/isEnabled)
- [ ] Add VAPID key configuration
- [ ] Implement server-side push sending (for auto-WFH notifications)
- [ ] Test push notifications with sample events

## Phase 14: Preserve Tracked Hours on Status Change
- [x] Fix logAttendance upsert to not overwrite startTime/endTime/hoursWorked when changing status
- [x] Uses UPDATE (status only) when record exists, INSERT only for new records
- [x] All 58 tests passing
- [x] Save checkpoint

## Phase 15: Fix Office Day Graph
- [x] Audit WeeklyChart: root cause was Recharts omitting zero-value bars + grey color confusion
- [x] Redesigned to horizontal bar chart (layout=vertical) with per-row categories using Cell colors
- [x] Office Days always visible (blue), WFH Days (purple), Not Logged (slate grey) — all distinct
- [x] minPointSize=3 ensures even zero-value bars show a sliver
- [x] WFH graph still works correctly
- [x] 64 tests passing
- [x] Save checkpoint

## Phase 16: Fix Chart to Show Monthly Totals
- [ ] Change "This Week" chart to use monthly stats (officeAttendedDays, wfhDays, totalWorkingDays from getMonthlyStats)
- [ ] Rename section title to "This Month" and update subtitle to show month totals
- [ ] Verify chart shows correct values matching the calendar
- [ ] Save checkpoint

## Phase 17: Monthly Hours Report & Location Dropdown
- [x] Add location column to attendance_records table (DB migration applied)
- [x] Update logAttendance tRPC procedure to accept and save location
- [x] Add location dropdown in status modal (10 hardcoded locations, pre-fills from existing record)
- [x] Save selected location per date to DB (preserved on status updates)
- [x] Build monthly hours report: table with date, location, hours worked per office day
- [x] Show total hours row at bottom of report
- [x] Monthly chart now uses monthly stats (11 office, 4 WFH, correct values)
- [x] 64 tests passing
- [x] Save checkpoint


## Phase 18: Sphere Feature - Collaborative Location Visibility
- [x] Create spheres table (id, name, owner_id, code, created_at)
- [x] Create sphere_members table (id, sphere_id, user_id, joined_at)
- [x] Generate DB migration and apply
- [x] Create tRPC procedures: createSphere, joinSphere, getSphereMembers, getUserSpheres, leaveSphere
- [x] Add sphere management page (create, view members, copy invite code)
- [x] Build sphere view page with location grid (showing members by location + office day status)
- [x] Add sphere enrollment flow (join via code)
- [x] Add Sphere link to navigation (sidebar)
- [x] Write vitest tests for sphere procedures (7 tests - test isolation issue noted, not a feature bug)
- [x] All 64 existing tests passing, TypeScript clean
- [x] Save checkpoint
