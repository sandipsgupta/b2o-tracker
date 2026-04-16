import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import WeeklyChart from "@/components/WeeklyChart";

export default function SharedDashboard() {
  const { token } = useParams<{ token: string }>();

  const sharedData = trpc.public.getSharedDashboard.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Share Link</CardTitle>
            <CardDescription>The share link is missing or invalid</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (sharedData.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sharedData.isError || !sharedData.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Share Link Expired</CardTitle>
            <CardDescription>This share link has expired or is no longer valid</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { monthlyStats, records } = sharedData.data;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Attendance Summary</h1>
          <p className="text-muted-foreground">Public attendance dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>This Month</CardTitle>
              <CardDescription>Attendance progress toward target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-2xl font-bold">{monthlyStats.attendancePercentage}%</span>
                </div>
                <Progress value={monthlyStats.attendancePercentage} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Attended</p>
                  <p className="text-2xl font-semibold">{monthlyStats.officeAttendedDays}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Days</p>
                  <p className="text-2xl font-semibold">{monthlyStats.totalWorkingDays}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-2xl font-semibold">{monthlyStats.targetPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthlyStats.remainingDaysNeeded === 0 ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-green-900">Target Met!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Attendance goal achieved for this month
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="font-semibold text-amber-900">
                    {monthlyStats.remainingDaysNeeded} Days Needed
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    to reach {monthlyStats.targetPercentage}% target
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>This month's attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-4">
              {records.map((record, idx) => {
                const date = new Date(record.date + "T00:00:00Z");
                const dayOfMonth = date.getUTCDate();

                const statusColor =
                  record.status === "office"
                    ? "bg-blue-100 text-blue-900"
                    : record.status === "wfh"
                    ? "bg-purple-100 text-purple-900"
                    : "bg-amber-100 text-amber-900";

                return (
                  <div
                    key={idx}
                    className={`aspect-square p-2 rounded-lg border-2 flex items-center justify-center text-sm font-medium ${statusColor}`}
                  >
                    {dayOfMonth}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>This is a read-only public dashboard. No sensitive data is displayed.</p>
        </div>
      </div>
    </div>
  );
}
