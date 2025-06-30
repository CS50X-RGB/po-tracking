"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";

interface OTDGaugeChartProps {
  percentage: number; // e.g., 85 for 85% OTD
}

export default function OTDGaugeChart({ percentage }: OTDGaugeChartProps) {
  const value = percentage > 100 ? 100 : percentage;
  const data = [{ value }, { value: 100 - value }];

  const COLORS = ["#3b82f6", "#e5e7eb"]; // blue, gray

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            startAngle={180}
            endAngle={0}
            data={data}
            cx="50%"
            cy="100%"
            innerRadius="60%"
            outerRadius="80%"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          {/* Optional: Add needle or percentage text here */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
