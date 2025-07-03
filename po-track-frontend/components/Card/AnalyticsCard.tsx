import { Card } from "@heroui/react";
import Link from "next/link";

interface AnalyticsCardProps {
  title1: string;
  value1: string | number;
  title2: string;
  value2: string | number;
  href1?: string;
  href2?: string;
}

export default function AnalyticsCard({
  title1,
  value1,
  title2,
  value2,
  href1,
  href2,
}: AnalyticsCardProps) {
  return (
    <Card className="w-full flex flex-col p-2 space-y-2">
      {href1 ? (
        <Link href={href1}>
          <div className="flex flex-col space-y-1 p-2 hover:text-blue-500  rounded cursor-pointer">
            <p className="text-sm">{title1}</p>
            <p className="text-2xl font-bold">{value1}</p>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm">{title1}</p>
          <p className="text-2xl font-bold">{value1}</p>
        </div>
      )}

      {href2 ? (
        <Link href={href2}>
          <div className="flex flex-col space-y-1 p-2 hover:text-blue-500 rounded cursor-pointer">
            <p className="text-sm">{title2}</p>
            <p className="text-2xl font-bold">{value2}</p>
          </div>
        </Link>
      ) : (
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm">{title2}</p>
          <p className="text-2xl font-bold">{value2}</p>
        </div>
      )}
    </Card>
  );
}
