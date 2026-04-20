import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Clock, Play, Square } from "lucide-react";

interface TimeTrackerProps {
  date: string;
  onClose?: () => void;
}

export function TimeTracker({ date, onClose }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [hoursDisplay, setHoursDisplay] = useState("0h 0m");
  const [startTimeRef, setStartTimeRef] = useState<string | null>(null);

  const startTracking = trpc.timeTracking.startTracking.useMutation();
  const stopTracking = trpc.timeTracking.stopTracking.useMutation();
  const getStatus = trpc.timeTracking.getTrackingStatus.useQuery({ date }, {
    refetchInterval: 5000, // Refetch every 5 seconds to stay in sync
  });

  // Initialize and auto-start if not already tracking
  useEffect(() => {
    if (getStatus.data) {
      setIsTracking(getStatus.data.isTracking || false);
      setStartTimeRef(getStatus.data.startTime);
      
      // Display completed hours if tracking is done
      if (getStatus.data.hoursWorked) {
        const hours = Math.floor(getStatus.data.hoursWorked / 60);
        const mins = getStatus.data.hoursWorked % 60;
        setHoursDisplay(`${hours}h ${mins}m`);
      }
    }
  }, [getStatus.data]);

  // Update elapsed time display every second when tracking
  useEffect(() => {
    if (!isTracking || !startTimeRef) return;

    const updateDisplay = () => {
      const start = new Date(startTimeRef).getTime();
      const now = new Date().getTime();
      const elapsedMs = now - start;
      const elapsedMins = Math.floor(elapsedMs / (1000 * 60));
      
      // Auto-stop after 8 hours (480 minutes)
      if (elapsedMins >= 480) {
        handleStop();
        return;
      }
      
      const hours = Math.floor(elapsedMins / 60);
      const mins = elapsedMins % 60;
      setHoursDisplay(`${hours}h ${mins}m`);
      setElapsedMinutes(elapsedMins);
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 1000);
    return () => clearInterval(interval);
  }, [isTracking, startTimeRef]);



  const handleStart = async () => {
    try {
      const result = await startTracking.mutateAsync({ date });
      setIsTracking(true);
      setElapsedMinutes(0);
      setHoursDisplay("0h 0m");
      // Update startTimeRef so the live timer kicks in immediately
      setStartTimeRef(result.startTime ?? null);
    } catch (error) {
      console.error("Failed to start tracking:", error);
    }
  };

  const handleStop = async () => {
    try {
      const result = await stopTracking.mutateAsync({ date });
      setIsTracking(false);
      setStartTimeRef(null);
      setHoursDisplay(result.hoursDisplay);
      await getStatus.refetch();
      // Don't auto-close — let user see the final time before closing
    } catch (error) {
      console.error("Failed to stop tracking:", error);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-blue-900">Time Tracking</span>
      </div>

      <div className="text-2xl font-bold text-blue-900">{hoursDisplay}</div>

      <div className="flex gap-2">
        {!isTracking ? (
          <Button
            onClick={handleStart}
            disabled={startTracking.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            disabled={stopTracking.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-600">
        {isTracking
          ? "Timer running... Auto-stops after 8 hours"
          : "Click Start to begin tracking your work hours"}
      </p>
    </div>
  );
}
