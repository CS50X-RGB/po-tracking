"use client";
import OTDGaugeChart from "@/components/Graphs/OTDGaugeChart";
import { getData } from "@/core/api/apiHandler";
import { analyticsRoute } from "@/core/api/apiRoutes";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

export default function OTD() {
  const [year, setYear] = useState<any>(null);
  const [supplier, setSupplier] = useState<any>(null);
  const [isParamsReady, setIsParamsReady] = useState(false);
  const params = useSearchParams();

  // Read params on mount
  useEffect(() => {
    const yearParam = params.get("year");
    const supplierParam = params.get("supplier");

    if (yearParam && supplierParam) {
      setYear(yearParam);
      setSupplier(supplierParam);
      setIsParamsReady(true);
    }
  }, [params]);

  // Fetch API only after params are ready
  const {
    data: getAvgOtd,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ["getAvgOtd", year, supplier],
    queryFn: () => getData(`${analyticsRoute.getOTD}${year}/${supplier}`, {}),
    enabled: isParamsReady, // <-- only run when params are set
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prepareYearWiseData = (yearData: any) => {
    return monthNames.map((month, i) => ({
      month,
      value: yearData.monthsOtd?.[i] ?? 0,
    }));
  };

  if (!isParamsReady || isFetching) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-4">
      {Object.entries(getAvgOtd?.data?.data || {})
        .reverse()
        .map(([year, data]: any, index: number) => (
          <div key={index} className="flex flex-row items-center w-full">
            <div className="flex flex-row items-center gap-4 w-full">
              <Card className="flex flex-col items-center gap-4 w-full">
                <CardHeader className="text-2xl font-bold">
                  {year} OTD Overall Graph
                </CardHeader>
                <CardBody>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={prepareYearWiseData(data)}>
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#ffffff", fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "#ffffff", fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        shape={(props: any) => {
                          const { x, y, width, height, value } = props;
                          const fill = value === 50 ? "#FF4136" : "#8884d8";
                          return (
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              fill={fill}
                            />
                          );
                        }}
                      >
                        <LabelList
                          dataKey="value"
                          position="top"
                          formatter={(val) => `${val}%`}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
              <Card className="flex flex-col items-center gap-4 w-[400px]">
                <OTDGaugeChart
                  supplier={supplier}
                  year={year}
                  percentage={data.avgOtd}
                />
                <h1>Average OTD</h1>
              </Card>
            </div>
          </div>
        ))}
    </div>
  );
}
