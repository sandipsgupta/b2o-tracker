import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Lightbulb } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AIInsightsProps {
  stats: {
    attendancePercentage: number;
    officeAttendedDays: number;
    totalWorkingDays: number;
    remainingDaysNeeded: number;
    targetPercentage: number;
  };
}

export default function AIInsights({ stats }: AIInsightsProps) {
  const generateAIInsights = trpc.ai.generateInsights.useQuery();

  const insights = generateAIInsights.data?.insights || [];
  const isLoading = generateAIInsights.isLoading;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">AI Insights</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Generating insights...</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-blue-900 flex gap-2">
                <span className="text-blue-600 font-semibold">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
