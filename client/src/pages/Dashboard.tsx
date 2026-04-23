import { useState, useEffect } from "react";
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
import { TimeTracker } from "@/components/TimeTracker";

const OFFICE_LOCATIONS = [
  "Minneapolis Plaza",
  "Hopkins, MN",
  "Irwing, TX",
  "Atlanta",
  "Cincinati",
  "Bay Area",
  "New York",
  "New Jersey",
  "Charlotte, NC",
  "Columbia Center, OR",
];

export default function Dashboard() {
  const [, navigate] = useLocation();

  // ── Modal state lifted to Dashboard level ──────────────────────────────────
  // This ensures the modal survives any re-renders or remounts of AttendanceCalendar.
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locationSaved, setLocationSaved] = useState(false);
  // ──────────────────────────────────────────────────────────────────────────

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
      setShowStatusMenu(false);
    },
    onError: (error) => {
      console.error("Failed to delete attendance:", error);
    },
  });

  const today = getTodayLocalDateString();

  // Fetch today's time tracking status — poll every 30s to stay in sync
  const timeTrackingStatus = trpc.timeTracking.getTrackingStatus.useQuery(
    { date: today },
    { refetchInterval: 30000 }
  );

  // Live elapsed time display for active tracking session
  const [liveHoursDisplay, setLiveHoursDisplay] = useState("0h 0m");
  useEffect(() => {
    const data = timeTrackingStatus.data;
    if (!data?.isTracking || !data.startTime) {
      // Show completed hours if available
      if (data?.hoursWorked) {
        const h = Math.floor(data.hoursWorked / 60);
        const m = data.hoursWorked % 60;
        setLiveHoursDisplay(`${h}h ${m}m`);
      } else {
        setLiveHoursDisplay("0h 0m");
      }
      return;
    }
    // Update every second while tracking
    const tick = () => {
      const start = new Date(data.startTime!).getTime();
      const elapsedMs = Date.now() - start;
      const totalMins = Math.floor(elapsedMs / 60000);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      setLiveHoursDisplay(`${h}h ${m}m`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timeTrackingStatus.data]);

  // Only show full-page spinner on initial load, NOT on refetches.
  const isInitialLoading = weeklyStats.isLoading || monthlyStats.isLoading || trendData.isLoading || attendanceRecords.isLoading;

  // DEBUG: log state changes
  console.log('[Dashboard] isInitialLoading:', isInitialLoading, 'showStatusMenu:', showStatusMenu,
    'weekly.isLoading:', weeklyStats.isLoading, 'monthly.isLoading:', monthlyStats.isLoading,
    'trend.isLoading:', trendData.isLoading, 'records.isLoading:', attendanceRecords.isLoading);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const getRecord = (dateStr: string) =>
    attendanceRecords.data?.find(r => r.date === dateStr);
  const getRecordStatus = (dateStr: string) => getRecord(dateStr)?.status;

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = getRecord(dateStr);
    setSelectedLocation(existing?.location ?? "");
    setLocationSaved(false);
    setPendingStatus(null);
    setShowStatusMenu(true);
  };

  const handleStatusSelect = (status: "office" | "wfh" | "planned" | "holiday" | "time-off") => {
    if (selectedDate) {
      setPendingStatus(status);
      const loc = status === "office" ? selectedLocation || undefined : undefined;
      logAttendance.mutate({ date: selectedDate, status, location: loc });
      // Do NOT auto-close — let user close manually
    }
  };

  const handleSaveLocation = () => {
    if (selectedDate) {
      const existingStatus = getRecordStatus(selectedDate);
      const effectiveStatus = existingStatus === "office" ? "office" : (pendingStatus === "office" ? "office" : null);
      if (effectiveStatus === "office") {
        logAttendance.mutate({ date: selectedDate, status: "office", location: selectedLocation || undefined });
        setLocationSaved(true);
        setTimeout(() => setLocationSaved(false), 2000);
      }
    }
  };

  const handleDeleteRecord = () => {
    if (selectedDate) {
      deleteAttendance.mutate({ date: selectedDate });
      // setShowStatusMenu(false) is called in deleteAttendance.onSuccess
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "office": return "🏢";
      case "wfh": return "🏠";
      case "planned": return "📅";
      case "holiday": return "🎉";
      case "time-off": return "🌴";
      default: return "";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "office": return "Office Day";
      case "wfh": return "WFH";
      case "planned": return "Planned";
      case "holiday": return "Holiday";
      case "time-off": return "Time Off";
      default: return "";
    }
  };
  // ──────────────────────────────────────────────────────────────────────────

  const isModalLoading = logAttendance.isPending || deleteAttendance.isPending;

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
                  status: r.status as "office" | "wfh" | "planned" | "holiday" | "time-off",
                  location: r.location,
                })) || []}
                onDateClick={handleDateClick}
              />
              <p className="text-xs text-muted-foreground mt-3">💡 You can edit today and future dates in the current month to plan ahead. Mark days as Planned or Holiday to forecast your attendance.</p>
            </CardContent>
          </Card>

          {/* Monthly Attendance Chart */}
          {monthlyStats.data && (
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
                <CardDescription>
                  {monthlyStats.data.officeAttendedDays} office &amp; {monthlyStats.data.wfhDays} WFH of {monthlyStats.data.totalWorkingDays} working days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyChart stats={monthlyStats.data} />
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

          {/* Monthly Hours Report */}
          {attendanceRecords.data && attendanceRecords.data.some(r => r.status === "office") && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Hours Report</CardTitle>
                <CardDescription>
                  Time logged per office day this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Date</th>
                        <th className="pb-2 pr-4 font-medium">Location</th>
                        <th className="pb-2 font-medium text-right">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {attendanceRecords.data
                        .filter(r => r.status === "office")
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map(r => {
                          const mins = r.hoursWorked ?? 0;
                          const h = Math.floor(mins / 60);
                          const m = mins % 60;
                          const hoursDisplay = mins > 0 ? `${h}h ${m}m` : "—";
                          return (
                            <tr key={r.date} className="hover:bg-muted/30 transition-colors">
                              <td className="py-2 pr-4 font-medium">
                                {new Date(r.date + "T00:00:00").toLocaleDateString("en-US", {
                                  weekday: "short", month: "short", day: "numeric"
                                })}
                              </td>
                              <td className="py-2 pr-4 text-muted-foreground">
                                {r.location ?? <span className="italic text-gray-400">No location</span>}
                              </td>
                              <td className="py-2 text-right font-mono font-semibold">
                                <span className={mins > 0 ? "text-blue-600" : "text-gray-400"}>
                                  {hoursDisplay}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-semibold">
                        <td className="pt-2 pr-4">Total</td>
                        <td className="pt-2 pr-4"></td>
                        <td className="pt-2 text-right font-mono text-blue-600">
                          {(() => {
                            const totalMins = attendanceRecords.data
                              .filter(r => r.status === "office")
                              .reduce((sum, r) => sum + (r.hoursWorked ?? 0), 0);
                            const h = Math.floor(totalMins / 60);
                            const m = totalMins % 60;
                            return totalMins > 0 ? `${h}h ${m}m` : "—";
                          })()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
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

          {/* Hours Worked Today — always visible */}
          <Card>
            <CardHeader>
              <CardTitle>Hours Today</CardTitle>
              <CardDescription>Time tracking for office days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-600">
                  {liveHoursDisplay}
                </div>
                <p className="text-sm text-muted-foreground">
                  {timeTrackingStatus.data?.isTracking
                    ? "⏱️ Timer running — open today in calendar to stop"
                    : timeTrackingStatus.data?.hoursWorked
                    ? "✓ Session complete"
                    : "Click today in the calendar to start tracking"}
                </p>
              </div>
            </CardContent>
          </Card>

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

      {/* ── Status Modal — rendered at Dashboard level so it survives calendar re-renders ── */}
      {showStatusMenu && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h4>

            {/* Show TimeTracker only when Office status is selected for today */}
            {(getRecordStatus(selectedDate) === "office" || pendingStatus === "office") && selectedDate === today && (
              <div className="mb-4">
                <TimeTracker date={selectedDate} onClose={() => setShowStatusMenu(false)} />
              </div>
            )}

            {/* Location dropdown — shown ONLY when status is Office Day (existing or just selected) */}
            {(getRecordStatus(selectedDate) === "office" || pendingStatus === "office") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Location <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">— Select location —</option>
                    {OFFICE_LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveLocation}
                    disabled={isModalLoading}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      locationSaved
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {locationSaved ? "✓ Saved" : "Save"}
                  </button>
                </div>
              </div>
            )}

            {/* Status buttons */}
            <div className="space-y-2">
              {(["office", "wfh", "planned", "holiday", "time-off"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                  disabled={isModalLoading}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  <span className="text-lg mr-2">{getStatusIcon(status)}</span>
                  <span className="font-medium">{getStatusLabel(status)}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2">
              {getRecordStatus(selectedDate) && (
                <button
                  onClick={handleDeleteRecord}
                  disabled={isModalLoading}
                  className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowStatusMenu(false)}
                className="w-full p-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
