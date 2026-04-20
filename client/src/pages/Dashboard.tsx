import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { getTodayLocalDateString, localDateToString } from "@/lib/timezone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import WeeklyChart from "@/components/WeeklyChart";
import MonthlyProgress from "@/components/MonthlyProgress";
import RemainingDaysCounter from "@/components/RemainingDaysCounter";
import TrendChart from "@/components/TrendChart";
import AIInsights from "@/components/AIInsights";

export default function Dashboard() {
  const [, navigate] = useLocation();

  // Fetch data
  const weeklyStats = trpc.attendance.getWeeklyStats.useQuery();
  const monthlyStats = trpc.attendance.getMonthlyStats.useQuery();
  const trendData = trpc.attendance.getTrendData.useQuery({ weeks: 12 });
  
  // Fetch entire current month's records using local timezone
  const currentDate = new Date();
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const attendanceRecords = trpc.attendance.getRecords.useQuery({
    startDate: localDateToString(monthStart),
    endDate: localDateToString(monthEnd),
  });

  const logAttendance = trpc.attendance.logAttendance.useMutation({
    onSuccess: () => {
      // Refetch all stats after logging attendance
      weeklyStats.refetch();
      monthlyStats.refetch();
      trendData.refetch();
      attendanceRecords.refetch();
    },
    onError: (error) => {
      console.error("Failed to log attendance:", error);
    },
  });

  const deleteAttendance = trpc.attendance.deleteAttendance.useMutation({
    onSuccess: () => {
      // Refetch all stats after deleting attendance
      weeklyStats.refetch();
      monthlyStats.refetch();
      trendData.refetch();
      attendanceRecords.refetch();
    },
    onError: (error) => {
      console.error("Failed to delete attendance:", error);
    },
  });

  const today = getTodayLocalDateString();

  // Fetch today's time tracking status
  const timeTrackingStatus = trpc.timeTracking.getTrackingStatus.useQuery({ date: today });

  const isLoading = weeklyStats.isLoading || monthlyStats.isLoading || trendData.isLoading || attendanceRecords.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track and plan your office attendance • Today: {today}</p>
        </div>
        <Button onClick={() => navigate("/settings")} variant="outline">
          Settings
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calendar and Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Log Attendance</CardTitle>
              <CardDescription>Click on dates to mark as Office Day or WFH</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceCalendar
                records={attendanceRecords.data?.map(r => ({
                  date: r.date,
                  status: r.status as "office" | "wfh" | "planned" | "holiday" | "time-off"
                })) || []}
                onDateSelect={(date, status: "office" | "wfh" | "planned" | "holiday" | "time-off") => {
                  logAttendance.mutate({ date, status });
                }}
                onDateDelete={(date) => {
                  deleteAttendance.mutate({ date });
                }}
                isLoading={logAttendance.isPending || deleteAttendance.isPending}
              />
              <p className="text-xs text-muted-foreground mt-3">💡 You can edit today and future dates in the current month to plan ahead. Mark days as Planned or Holiday to forecast your attendance.</p>
            </CardContent>
          </Card>

          {/* Weekly Chart */}
          {weeklyStats.data && (
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
                <CardDescription>
                  {weeklyStats.data.officeAttendedDays} of {weeklyStats.data.totalWorkingDays} working days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyChart stats={weeklyStats.data} />
              </CardContent>
            </Card>
          )}

          {/* Trend Chart */}
          {trendData.data && trendData.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>Last 12 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart data={trendData.data} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats and AI Insights */}
        <div className="space-y-6">
          {/* Monthly Progress */}
          {monthlyStats.data && (
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
                <CardDescription>Progress toward your target</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyProgress stats={monthlyStats.data} />
              </CardContent>
            </Card>
          )}

          {/* Hours Worked Today */}
          {timeTrackingStatus.data && (
            <Card>
              <CardHeader>
                <CardTitle>Hours Today</CardTitle>
                <CardDescription>Time tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {timeTrackingStatus.data.hoursWorked ? `${Math.floor(timeTrackingStatus.data.hoursWorked / 60)}h ${timeTrackingStatus.data.hoursWorked % 60}m` : "0h 0m"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {timeTrackingStatus.data.isTracking ? "⏱️ Timer running" : "✓ Tracking available"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Days Needed */}
          {monthlyStats.data && (
            <Card>
              <CardHeader>
                <CardTitle>Days Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <RemainingDaysCounter stats={monthlyStats.data} />
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {monthlyStats.data && (
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Smart recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <AIInsights stats={monthlyStats.data} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
