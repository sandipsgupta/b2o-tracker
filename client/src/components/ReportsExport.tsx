import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function ReportsExport() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const exportWeeklyCSV = trpc.reports.exportWeeklyCSV.useQuery();
  const exportMonthlyCSV = trpc.reports.exportMonthlyCSV.useMutation({
    onSuccess: (data) => {
      if (data) {
        downloadCSV(data.content, data.filename);
        toast.success("Report downloaded!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to export report");
    },
  });

  const downloadCSV = (content: string, filename: string) => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadWeeklyCSV = () => {
    if (exportWeeklyCSV.data) {
      downloadCSV(exportWeeklyCSV.data.content, exportWeeklyCSV.data.filename);
      toast.success("Weekly report downloaded!");
    }
  };

  const handleDownloadMonthlyCSV = () => {
    if (!selectedMonth) {
      toast.error("Please select a month");
      return;
    }

    const [year, month] = selectedMonth.split("-");
    exportMonthlyCSV.mutate({
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    });
  };

  // Generate month options for the last 12 months
  const now = new Date();
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    monthOptions.push({ value, label });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Reports</CardTitle>
        <CardDescription>Download your attendance data as CSV</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Report */}
        <div className="space-y-3">
          <h3 className="font-semibold">This Week</h3>
          <Button
            onClick={handleDownloadWeeklyCSV}
            disabled={exportWeeklyCSV.isLoading}
            className="w-full"
            variant="outline"
          >
            {exportWeeklyCSV.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Weekly Report (CSV)
              </>
            )}
          </Button>
        </div>

        {/* Monthly Report */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-semibold">Monthly Reports</h3>
          <div className="space-y-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Select a month...</option>
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              onClick={handleDownloadMonthlyCSV}
              disabled={exportMonthlyCSV.isPending || !selectedMonth}
              className="w-full"
              variant="outline"
            >
              {exportMonthlyCSV.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Monthly Report (CSV)
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-900">
            <strong>Note:</strong> Reports are exported as CSV files that can be opened in Excel or Google Sheets.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
