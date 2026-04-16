# B2O Tracker - Back-to-Office Attendance Tracker

A production-ready AI-native web application that helps users track and plan their in-office attendance against a configurable target (default: 60% of working days), with analytics, forecasting, and shareable dashboards.

## 🎯 Features

### Core Functionality
- **User Authentication**: Manus OAuth integration with profile management (name, role, organization/team)
- **Attendance Tracking**: Daily logging with "Office Day" or "WFH" toggle, plus calendar-style multi-day selection
- **Smart Attendance Engine**: 
  - Configurable working days (Mon–Fri default)
  - 60% office attendance target calculation
  - Weekly and monthly percentage statistics
  - "X more days needed" countdown to reach target
- **Future Planning**: Select and visualize planned office days with editable calendar
- **Visual Dashboard**: 
  - Weekly attendance bar chart
  - Monthly progress bar
  - Remaining days counter
  - Weekly trend line chart (last 12 weeks)
- **AI-Powered Insights**: LLM-generated recommendations with fallback rule-based suggestions
- **Public Shareable Dashboards**: Read-only access via unique token links (no personal data exposed)
- **Report Generation**: Weekly and monthly reports with CSV export
- **Mobile Responsive**: Full responsive design optimized for all devices

## 🛠 Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui components, Recharts
- **Backend**: Express 4, tRPC 11, Drizzle ORM
- **Database**: MySQL
- **Authentication**: Manus OAuth
- **Testing**: Vitest with comprehensive test coverage
- **Deployment**: Manus Platform with auto-scaling

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ and pnpm 10+
- MySQL database (local or remote)
- Manus OAuth credentials (for authentication)
- Git installed on your system

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/b2o-tracker.git
cd b2o-tracker
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database Connection
DATABASE_URL=mysql://username:password@localhost:3306/b2o_tracker

# Authentication
JWT_SECRET=your-secret-key-here-min-32-chars
VITE_APP_ID=your-manus-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Owner Information (optional)
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name

# Manus Built-in APIs (optional, for advanced features)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### 4. Set Up Database

Generate and apply database migrations:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Or use the shorthand:

```bash
pnpm db:push
```

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173` (frontend) and `http://localhost:3000` (API server).

## 📁 Project Structure

```
client/
  src/
    pages/          # Page components (Dashboard, Settings, SharedDashboard, etc.)
    components/     # Reusable UI components (Calendar, Charts, AIInsights, etc.)
    contexts/       # React contexts for theming
    hooks/          # Custom hooks (useAuth, etc.)
    lib/            # Utilities (tRPC client, etc.)
    index.css       # Global styles and design tokens
    App.tsx         # Main app routes
    main.tsx        # Entry point

server/
  routers/          # tRPC procedure routers (attendance, profile, public, reports, ai)
  db.ts             # Database query helpers
  routers.ts        # Main router configuration
  auth.logout.test.ts
  attendance.test.ts
  ai.test.ts

drizzle/
  schema.ts         # Database schema definition
  migrations/       # Generated SQL migrations

shared/
  attendance.ts     # Shared attendance calculation utilities
  const.ts          # Shared constants

scripts/
  seed-data.mjs     # Sample data seeding script
```

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test -- --watch
```

Current test coverage includes:
- Authentication and logout flow
- Attendance calculations and statistics
- AI insights generation and parsing
- Date range utilities

## 🎨 Design System

The application uses an elegant light theme with professional color palette:

- **Primary**: Blue (oklch(0.6 0.15 258))
- **Accent**: Orange (oklch(0.7 0.15 40))
- **Background**: White with subtle gray accents
- **Text**: Dark gray for optimal readability

All colors are defined as CSS variables in `client/src/index.css` for easy customization.

## 📊 Key Features Explained

### Smart Attendance Engine

The attendance engine automatically calculates:
- **Working Days**: Configurable (default: Monday–Friday)
- **Target Percentage**: Default 60% of working days
- **Attendance Stats**: Weekly %, monthly %, total days attended
- **Remaining Days**: How many more days needed to reach target

Example: If April has 22 working days, target = 13 days (60%). If you've attended 8 days, you need 5 more.

### AI Insights

The AI layer provides contextual recommendations:
- **Behind Status**: "You are behind by X days this month"
- **Weekly Plans**: "Attend Tue & Thu next week to meet your target"
- **Consistency**: "You're maintaining strong attendance consistency!"
- **Forecasting**: Predictions based on current trends

If LLM fails, the system falls back to rule-based insights.

### Public Dashboards

Share your attendance progress securely:
- Generate unique share links with optional expiration dates
- Public viewers see only: attendance summary, monthly %, and charts
- No personal identifiers or sensitive data exposed
- Read-only access prevents unauthorized modifications

### Report Generation

Export your attendance data:
- **CSV Format**: Easily import into spreadsheets or other tools
- **Weekly Reports**: Last 7 days of attendance
- **Monthly Reports**: Full month breakdown
- **Custom Date Ranges**: Select any period for analysis

## 🔐 Security

- **Authentication**: Manus OAuth with secure session cookies
- **Authorization**: Role-based access control (user/admin)
- **Data Privacy**: Public dashboards expose no sensitive information
- **Database**: Encrypted connections with proper indexing
- **Environment Variables**: All secrets stored securely, never committed

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop browsers (1920px+)
- Tablets (768px–1024px)
- Mobile phones (320px–767px)

Test on mobile: Use browser DevTools → Toggle device toolbar

## 🚢 Deployment

### Deploy to Manus Platform

1. Create a checkpoint in the Management UI
2. Click the **Publish** button
3. Your app will be live at `https://b2otracker-xxxxx.manus.space`

### Deploy to Other Platforms

The application can be deployed to Vercel, Netlify, Railway, or any Node.js hosting:

```bash
pnpm build
pnpm start
```

## 🐛 Troubleshooting

### Database Connection Errors

- Verify `DATABASE_URL` is correct and the database is running
- Check MySQL credentials and permissions
- Ensure the database exists: `CREATE DATABASE b2o_tracker;`

### OAuth Login Issues

- Confirm `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct
- Check that redirect URL matches your Manus OAuth app settings
- Clear browser cookies and try again

### Missing Environment Variables

- Copy `.env.local.example` to `.env.local` (if available)
- Ensure all required variables are set
- Restart the dev server after updating `.env.local`

### Tests Failing

- Run `pnpm test -- --reporter=verbose` for detailed output
- Check database connection in test environment
- Ensure all dependencies are installed: `pnpm install`

## 📚 API Documentation

### tRPC Procedures

All API calls use tRPC with end-to-end type safety. Key routers:

#### Attendance Router (`trpc.attendance.*`)
- `logAttendance(date, status)` - Log daily attendance
- `getMonthAttendance(year, month)` - Get month statistics
- `getWeekAttendance(date)` - Get week statistics
- `deleteAttendance(date)` - Remove attendance record

#### Profile Router (`trpc.profile.*`)
- `getProfile()` - Get current user profile
- `updateProfile(name, role, organization)` - Update profile
- `getSettings()` - Get user settings
- `updateSettings(targetPercentage, workingDays)` - Update settings

#### AI Router (`trpc.ai.*`)
- `generateInsights(stats)` - Generate AI recommendations

#### Reports Router (`trpc.reports.*`)
- `generateCSV(startDate, endDate)` - Export as CSV

#### Public Router (`trpc.public.*`)
- `getSharedDashboard(token)` - Access public dashboard
- `createShareLink(expiresIn)` - Generate share link
- `getShareLinks()` - List all share links

## 🤝 Contributing

To contribute improvements:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test thoroughly
3. Run `pnpm test` to ensure all tests pass
4. Commit with clear messages: `git commit -m "Add feature: description"`
5. Push and create a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💬 Support

For issues, questions, or suggestions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review existing GitHub issues
- Create a new issue with detailed description and steps to reproduce

## 🎉 What's Next?

Consider adding these features:
- **Team Comparison**: View attendance across team members
- **Notifications**: Email/SMS reminders for office days
- **Calendar Integration**: Sync with Google Calendar or Outlook
- **Mobile App**: Native iOS/Android applications
- **Advanced Analytics**: Predictive attendance modeling
- **Integrations**: Slack, Microsoft Teams, Jira status updates

---

**Built with ❤️ using React, tRPC, and Manus Platform**

Happy tracking! 🎯
