"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function LeakageChart({
  data,
}: {
  data: any[];
}) {
  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-zinc-500">
        No leakage data available
      </div>
    );
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={300}
    >
      <BarChart data={data}>
        <XAxis
          dataKey="type"
          tick={{ fill: "#a1a1aa" }}
        />

        <YAxis
          tick={{ fill: "#a1a1aa" }}
        />

        <Tooltip />

        <Bar
          dataKey="loss"
          fill="#6366f1"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}