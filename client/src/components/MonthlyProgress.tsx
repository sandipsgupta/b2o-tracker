import { Progress } from "@/components/ui/progress";

interface MonthlyProgressProps {
  stats: {
    attendancePercentage: number;
    officeAttendedDays: number;
    totalWorkingDays: number;
    targetPercentage: number;
  };
}

export default function MonthlyProgress({ stats }: MonthlyProgressProps) {
  const isOnTrack = stats.attendancePercentage >= stats.targetPercentage;
  // Calculate target days needed (60% of total working days)
  const targetDaysNeeded = Math.floor((stats.targetPercentage / 100) * stats.totalWorkingDays + 0.5);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-2xl font-bold">{stats.attendancePercentage}%</span>
        </div>
        <Progress value={stats.attendancePercentage} className="h-3" />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <p className="text-xs text-muted-foreground">Attended</p>
          <p className="text-2xl font-semibold">{stats.officeAttendedDays}</p>
          <p className="text-xs text-muted-foreground">of {stats.totalWorkingDays} days</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Target</p>
          <p className="text-2xl font-semibold">{stats.targetPercentage}%</p>
          <p className="text-xs text-muted-foreground">{targetDaysNeeded} of {stats.totalWorkingDays} days</p>
        </div>
      </div>
    </div>
  );
}
