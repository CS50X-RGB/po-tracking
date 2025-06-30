import { Card } from "@heroui/react";
import React from "react";
import OTDGaugeChart from "../Graphs/OTDGaugeChart";
interface AnalyticsGraphCardProp {
  title: string;
  chart: string;
}
export default function AnalyticsGraphCard({
  title,
  chart,
}: AnalyticsGraphCardProp) {
  return (
    <Card className="w-full h-[336px] flex flex-col p-2 space-y-2">
      <h1 className="text-xl font-bold">{title}</h1>
      <div>{chart}</div>
      <OTDGaugeChart percentage={85} />
    </Card>
  );
}
