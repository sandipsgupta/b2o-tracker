import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  date: string;
  status: "office" | "wfh" | "planned";
}

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  onDateSelect: (date: string, status: "office" | "wfh" | "planned") => void;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AttendanceCalendar({
  records,
  onDateSelect,
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
    const dateStr = new Date(year, month - 1, date).toISOString().split("T")[0];
    calendarDays.push({ date, isCurrentMonth: false, dateStr });
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = new Date(year, month, i).toISOString().split("T")[0];
    calendarDays.push({ date: i, isCurrentMonth: true, dateStr });
  }

  // Next month's days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    const dateStr = new Date(year, month + 1, i).toISOString().split("T")[0];
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

  const handleStatusSelect = (status: "office" | "wfh" | "planned") => {
    if (selectedDate) {
      onDateSelect(selectedDate, status);
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
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
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

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          const status = getRecordStatus(day.dateStr);
          const isToday = day.dateStr === new Date().toISOString().split("T")[0];
          const isSelected = day.dateStr === selectedDate;
          // Allow editing all dates in the current month (past and future)
          const isEditable = day.isCurrentMonth;

          return (
            <button
              key={idx}
              onClick={() => isEditable && handleDateClick(day.dateStr)}
              disabled={isLoading || !isEditable}
              className={cn(
                "aspect-square p-2 rounded-lg border-2 transition-all text-sm font-medium",
                isEditable ? "cursor-pointer hover:shadow-md" : "opacity-30 cursor-default",
                isToday && "ring-2 ring-primary ring-offset-2",
                isSelected && "ring-2 ring-primary",
                getStatusColor(status),
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{day.date}</span>
                {status && (
                  <span className="text-xs mt-1">
                    {status === "office" ? "🏢" : status === "wfh" ? "🏠" : "📅"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Status Menu */}
      {showStatusMenu && selectedDate && (
        <div className="p-4 bg-card border rounded-lg space-y-3">
          <p className="text-sm font-medium">Select status for {selectedDate}:</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={getRecordStatus(selectedDate) === "office" ? "default" : "outline"}
              onClick={() => handleStatusSelect("office")}
              disabled={isLoading}
            >
              Office Day
            </Button>
            <Button
              size="sm"
              variant={getRecordStatus(selectedDate) === "wfh" ? "default" : "outline"}
              onClick={() => handleStatusSelect("wfh")}
              disabled={isLoading}
            >
              WFH
            </Button>
            <Button
              size="sm"
              variant={getRecordStatus(selectedDate) === "planned" ? "default" : "outline"}
              onClick={() => handleStatusSelect("planned")}
              disabled={isLoading}
            >
              Planned
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowStatusMenu(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
