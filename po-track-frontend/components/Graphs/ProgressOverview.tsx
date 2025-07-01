"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Legend,
} from "recharts";

interface DeliveryStatusPieChartProps {
  data: { name: string; value: number }[];
}

const RADIAN = Math.PI / 180;

// Renders the active shape with name, LIs, percentage, and pointer
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 6) * cos;
  const sy = cy + (outerRadius + 6) * sin;
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;

  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* Center name */}
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        className="text-sm fill-white"
      >
        {payload.name}
      </text>
      {/* Highlighted sector */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* Outer ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* Pointer line */}
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      {/* LIs label */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        className="text-xs fill-white"
      >
        {`${value}`}
      </text>
      {/* Percentage label */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={16}
        textAnchor={textAnchor}
        className="text-[10px] fill-gray-300"
      >
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

export default function DeliveryStatusPieChart({
  data,
}: DeliveryStatusPieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const COLORS = [
    "#22c55e", // green
    "#facc15", // yellow
    "#ef4444", // red
    "#3b82f6", // blue
    "#8b5cf6", // purple

    "#10b981", // emerald
    "#fde047", // amber
    "#f97316", // orange
    "#0ea5e9", // sky
    "#a855f7", // violet

    "#14b8a6", // teal
    "#fbbf24", // gold
    "#f87171", // rose
    "#60a5fa", // light blue
    "#c084fc", // light violet

    "#4ade80", // light green
    "#fcd34d", // light amber
    "#fb7185", // pink
    "#38bdf8", // cyan
    "#d946ef", // fuchsia
  ];
  // extend if needed

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          {/* <Legend
            verticalAlign="top" // or "top", "left", "right"
            align="center"
            iconType="star" // "circle", "square", etc.
            wrapperStyle={{ fontSize: "10px" }}
          /> */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
