import { useState, useEffect } from "react";
import { Play, Pause, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

interface TimeTrackerProps {
  date: string;
  onHoursSaved?: (hours: number) => void;
}

export default function TimeTracker({ date, onHoursSaved }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [manualHours, setManualHours] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  const startMutation = trpc.timeTracking.startTimeTracking.useMutation();
  const endMutation = trpc.timeTracking.endTimeTracking.useMutation();
  const setHoursMutation = trpc.timeTracking.setHoursWorked.useMutation();
  const getTrackingQuery = trpc.timeTracking.getTimeTracking.useQuery({ date });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          // Auto-end after 8 hours (28800 seconds)
          if (prev >= 28800) {
            handleStop();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const handleStart = async () => {
    setIsTracking(true);
    setElapsedSeconds(0);
    await startMutation.mutateAsync({ date });
  };

  const handleStop = async () => {
    setIsTracking(false);
    const result = await endMutation.mutateAsync({ date });
    if (result.hoursWorked) {
      onHoursSaved?.(result.hoursWorked);
    }
    // Refetch to update display
    getTrackingQuery.refetch();
  };

  const handleManualEntry = async () => {
    const hours = parseFloat(manualHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      alert("Please enter a valid number between 0 and 24");
      return;
    }
    await setHoursMutation.mutateAsync({ date, hours });
    setManualHours("");
    setShowManualEntry(false);
    onHoursSaved?.(hours);
    getTrackingQuery.refetch();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const displayHours = getTrackingQuery.data?.hoursWorked || 0;

  return (
    <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-slate-900">Time Tracking</span>
        </div>
        <span className="text-lg font-mono font-bold text-blue-600">
          {isTracking ? formatTime(elapsedSeconds) : `${displayHours}h`}
        </span>
      </div>

      <div className="flex gap-2">
        {!isTracking ? (
          <>
            <Button
              size="sm"
              onClick={handleStart}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={startMutation.isPending}
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowManualEntry(!showManualEntry)}
            >
              Manual
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={handleStop}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={endMutation.isPending}
          >
            <Pause className="h-4 w-4 mr-1" />
            Stop
          </Button>
        )}
      </div>

      {showManualEntry && (
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Hours (0-24)"
            value={manualHours}
            onChange={(e) => setManualHours(e.target.value)}
            min="0"
            max="24"
            step="0.5"
            className="h-8"
          />
          <Button
            size="sm"
            onClick={handleManualEntry}
            disabled={setHoursMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
