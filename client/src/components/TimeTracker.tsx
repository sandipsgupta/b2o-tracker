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

  const startTracking = trpc.timeTracking.startTracking.useMutation();
  const stopTracking = trpc.timeTracking.stopTracking.useMutation();
  const getStatus = trpc.timeTracking.getTrackingStatus.useQuery({ date });

  useEffect(() => {
    if (getStatus.data) {
      setIsTracking(getStatus.data.isTracking || false);
      if (getStatus.data.elapsedMinutes) {
        setElapsedMinutes(getStatus.data.elapsedMinutes);
      }
      if (getStatus.data.hoursWorked) {
        const hours = Math.floor(getStatus.data.hoursWorked / 60);
        const mins = getStatus.data.hoursWorked % 60;
        setHoursDisplay(`${hours}h ${mins}m`);
      }
    }
  }, [getStatus.data]);

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setElapsedMinutes((prev) => {
        const newMinutes = prev + 1;
        if (newMinutes >= 480) {
          handleStop();
          return 480;
        }
        const hours = Math.floor(newMinutes / 60);
        const mins = newMinutes % 60;
        setHoursDisplay(`${hours}h ${mins}m`);
        return newMinutes;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const handleStart = async () => {
    try {
      await startTracking.mutateAsync({ date });
      setIsTracking(true);
      setElapsedMinutes(0);
      setHoursDisplay("0h 0m");
    } catch (error) {
      console.error("Failed to start tracking:", error);
    }
  };

  const handleStop = async () => {
    try {
      const result = await stopTracking.mutateAsync({ date });
      setIsTracking(false);
      setHoursDisplay(result.hoursDisplay);
      await getStatus.refetch();
      onClose?.();
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
