import { AlertCircle, CheckCircle2 } from "lucide-react";

interface RemainingDaysCounterProps {
  stats: {
    remainingDaysNeeded: number;
    officeAttendedDays: number;
    targetPercentage: number;
  };
}

export default function RemainingDaysCounter({ stats }: RemainingDaysCounterProps) {
  const isTargetMet = stats.remainingDaysNeeded === 0;

  return (
    <div className="space-y-4">
      {isTargetMet ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Target Met!</p>
            <p className="text-sm text-green-700">You've reached your attendance goal</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">{stats.remainingDaysNeeded} More Days</p>
            <p className="text-sm text-amber-700">to reach your {stats.targetPercentage}% target</p>
          </div>
        </div>
      )}

      <div className="pt-4 border-t space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Days attended</span>
          <span className="font-semibold">{stats.officeAttendedDays}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Days remaining</span>
          <span className="font-semibold text-amber-600">{stats.remainingDaysNeeded}</span>
        </div>
      </div>
    </div>
  );
}
