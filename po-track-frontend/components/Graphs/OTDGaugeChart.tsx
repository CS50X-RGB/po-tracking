"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { useRouter } from "next/navigation";

interface OTDGaugeChartProps {
  percentage: number;
  year: any;
  supplier: any;
}

export default function OTDGaugeChart({
  percentage,
  year,
  supplier,
}: OTDGaugeChartProps) {
  console.log(supplier, "supplier");
  const value = Math.min(percentage, 100);
  const data = [{ value }, { value: 100 - value }];
  const COLORS = ["#3b82f6", "#e5e7eb"]; // blue, gray
  const router = useRouter();
  // Needle calculations
  const angle = 180 - (value / 100) * 180; // 0% -> 180deg, 100% -> 0deg
  const needleLength = 60; // adjust as needed

  return (
    <div className="relative w-full flex  flex-col justify-center items-center">
      {/* Gauge */}
      <ResponsiveContainer width="100%" aspect={2}>
        <PieChart
          onClick={() =>
            router.push(`/admin/otd?year=${year}&supplier=${supplier}`)
          }
        >
          <Pie
            data={data}
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="100%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          {/* Needle */}
          {/* <Sector
            cx={100} // number, not string
            cy={100}
            innerRadius={0}
            outerRadius={needleLength}
            startAngle={angle - 1}
            endAngle={angle + 1}
            fill="red"
          /> */}
        </PieChart>
      </ResponsiveContainer>
      <div className="text-2xl text-center font-bold">{value}%</div>
    </div>
  );
}
