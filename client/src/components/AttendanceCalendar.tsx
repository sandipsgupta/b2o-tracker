import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTodayLocalDateString, isFutureDate, localDateToString } from "@/lib/timezone";

interface AttendanceRecord {
  date: string;
  status: "office" | "wfh" | "planned" | "holiday" | "time-off";
}

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  onDateSelect: (date: string, status: "office" | "wfh" | "planned" | "holiday" | "time-off") => void;
  onDateDelete?: (date: string) => void;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AttendanceCalendar({
  records,
  onDateSelect,
  onDateDelete,
  isLoading,
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create array of dates to display
  const calendarDays: Array<{ date: number; isCurrentMonth: boolean; dateStr: string }> = [];

  // Previous month's days
  for (let i = (firstDay === 0 ? 6 : firstDay - 1); i > 0; i--) {
    const date = daysInPrevMonth - i + 1;
    const dateStr = localDateToString(new Date(year, month - 1, date));
    calendarDays.push({ date, isCurrentMonth: false, dateStr });
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = localDateToString(new Date(year, month, i));
    calendarDays.push({ date: i, isCurrentMonth: true, dateStr });
  }

  // Next month's days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    const dateStr = localDateToString(new Date(year, month + 1, i));
    calendarDays.push({ date: i, isCurrentMonth: false, dateStr });
  }

  const getRecordStatus = (dateStr: string) => {
    return records.find(r => r.date === dateStr)?.status;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowStatusMenu(true);
  };

  const handleStatusSelect = (status: "office" | "wfh" | "planned" | "holiday" | "time-off") => {
    if (selectedDate) {
      onDateSelect(selectedDate, status);
      setShowStatusMenu(false);
    }
  };

  const handleDeleteRecord = () => {
    if (selectedDate && onDateDelete) {
      onDateDelete(selectedDate);
      setShowStatusMenu(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "office":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "wfh":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "planned":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "holiday":
        return "bg-red-100 text-red-900 border-red-300";
      case "time-off":
        return "bg-orange-100 text-orange-900 border-orange-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "office":
        return "🏢";
      case "wfh":
        return "🏠";
      case "planned":
        return "📅";
      case "holiday":
        return "🎉";
      case "time-off":
        return "🌴";
      default:
        return "";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "office":
        return "Office Day";
      case "wfh":
        return "WFH";
      case "planned":
        return "Planned";
      case "holiday":
        return "Holiday";
      case "time-off":
        return "Time Off";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, idx) => {
          const status = getRecordStatus(day.dateStr);
          const isToday = day.dateStr === getTodayLocalDateString();
          const isFuture = isFutureDate(day.dateStr);
          // Allow editing past dates (office/wfh) and today/future dates (planned/holiday)
          const isEditable = day.isCurrentMonth;

          return (
            <button
              key={idx}
              onClick={() => isEditable && handleDateClick(day.dateStr)}
              disabled={!isEditable}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                day.isCurrentMonth ? "cursor-pointer" : "text-gray-400 bg-gray-50",
                isToday && "ring-2 ring-blue-500",
                status ? getStatusColor(status) : "bg-white border-gray-200 hover:border-blue-300",
                !isEditable && "opacity-50 cursor-not-allowed",
                isEditable && !status && "hover:bg-blue-50"
              )}
            >
              <div className="text-center">
                <div className="font-semibold">{day.date}</div>
                {status && <div className="text-lg">{getStatusIcon(status)}</div>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Status Menu */}
      {showStatusMenu && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h4>

            <div className="space-y-2">
              {(["office", "wfh", "planned", "holiday", "time-off"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                  className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
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
                  className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
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

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs pt-4 border-t">
        {(["office", "wfh", "planned", "holiday", "time-off"] as const).map(status => (
          <div key={status} className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon(status)}</span>
            <span className="text-gray-600">{getStatusLabel(status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
