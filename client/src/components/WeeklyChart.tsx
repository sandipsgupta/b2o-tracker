import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface WeeklyChartProps {
  stats: {
    officeAttendedDays: number;
    wfhDays: number;
    totalWorkingDays: number;
  };
}

export default function WeeklyChart({ stats }: WeeklyChartProps) {
  const data = [
    {
      name: "This Week",
      "Office Days": stats.officeAttendedDays,
      "WFH Days": stats.wfhDays,
      "Not Logged": Math.max(0, stats.totalWorkingDays - stats.officeAttendedDays - stats.wfhDays),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Office Days" fill="#3b82f6" />
        <Bar dataKey="WFH Days" fill="#a855f7" />
        <Bar dataKey="Not Logged" fill="#e5e7eb" />
      </BarChart>
    </ResponsiveContainer>
  );
}
