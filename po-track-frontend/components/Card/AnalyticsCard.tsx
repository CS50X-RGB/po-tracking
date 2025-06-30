import { Card, CardBody, CardHeader } from "@heroui/react";

interface AnalyticsCardProps {
  title1: string;
  value1: string | number;
  title2: string;
  value2: string | number;
}
export default function AnalyticsCard({
  title1,
  value1,
  title2,
  value2,
}: AnalyticsCardProps) {
  return (
    <Card className="w-full flex flex-col p-2 space-y-2">
      <div className="flex flex-col spce-y-2 p-2">
        <p className="text-sm">{title1}</p>
        <p className="text-2xl font-bold">{value1}</p>
      </div>
      <div className="flex flex-col spce-y-2 p-2">
        <p className="text-sm">{title2}</p>
        <p className="text-2xl font-bold">{value2}</p>
      </div>
    </Card>
  );
}
