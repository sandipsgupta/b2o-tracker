import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WeeklyChartProps {
  stats: {
    officeAttendedDays: number;
    wfhDays: number;
    totalWorkingDays: number;
  };
}

export default function WeeklyChart({ stats }: WeeklyChartProps) {
  const officeDays = Math.max(0, Number(stats.officeAttendedDays) || 0);
  const wfhDays = Math.max(0, Number(stats.wfhDays) || 0);
  const totalDays = Math.max(0, Number(stats.totalWorkingDays) || 0);
  const notLogged = Math.max(0, totalDays - officeDays - wfhDays);

  // Use a grouped bar chart with explicit per-category rows so each bar
  // is always rendered regardless of value (Recharts omits zero-value bars
  // in a standard grouped chart, which caused the "missing blue bar" issue).
  const data = [
    { category: "Office Days", value: officeDays, color: "#3b82f6" },
    { category: "WFH Days",    value: wfhDays,    color: "#a855f7" },
    { category: "Not Logged",  value: notLogged,  color: "#94a3b8" },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, Math.max(totalDays, 1)]}
          allowDecimals={false}
          tickCount={totalDays + 1}
        />
        <YAxis type="category" dataKey="category" width={90} />
        <Tooltip
          formatter={(value: number, _name: string, props: { payload?: { category?: string } }) =>
            [`${value} day${value !== 1 ? "s" : ""}`, props.payload?.category ?? ""]
          }
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} minPointSize={3}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
