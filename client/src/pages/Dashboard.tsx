import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Fetch data
  const weeklyStats = trpc.attendance.getWeeklyStats.useQuery();
  const monthlyStats = trpc.attendance.getMonthlyStats.useQuery();
  const trendData = trpc.attendance.getTrendData.useQuery({ weeks: 12 });
  const attendanceRecords = trpc.attendance.getRecords.useQuery({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const logAttendance = trpc.attendance.logAttendance.useMutation({
    onSuccess: () => {
      weeklyStats.refetch();
      monthlyStats.refetch();
      trendData.refetch();
      attendanceRecords.refetch();
    },
  });

  const isLoading = weeklyStats.isLoading || monthlyStats.isLoading || trendData.isLoading;

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
          <p className="text-muted-foreground mt-1">Track and plan your office attendance</p>
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
                records={attendanceRecords.data || []}
                onDateSelect={(date, status) => {
                  logAttendance.mutate({ date, status });
                }}
                isLoading={logAttendance.isPending}
              />
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

        {/* Right Column - Stats and Insights */}
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

          {/* Remaining Days */}
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
            <AIInsights stats={monthlyStats.data} />
          )}
        </div>
      </div>
    </div>
  );
}
