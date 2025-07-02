import { Card } from "@heroui/react";
import React from "react";

interface AnalyticsGraphCardProp {
  title: string;
  chart: React.ReactNode;
}

export default function AnalyticsGraphCard({
  title,
  chart,
}: AnalyticsGraphCardProp) {
  return (
    <Card className="w-full h-[336px] flex flex-col p-2 space-y-2 justify-center">
      <h1 className="text-xl text-center font-bold">{title}</h1>
      <div className="flex-grow flex-col flex justify-center items-center">
        {chart}
      </div>
    </Card>
  );
}
