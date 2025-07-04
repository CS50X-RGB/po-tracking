"use client";
import AnalyticsCard from "@/components/Card/AnalyticsCard";
import AnalyticsGraphCard from "@/components/Card/AnalyticsGraphCars";
import OTDGaugeChart from "@/components/Graphs/OTDGaugeChart";
import DeliveryStatusPieChart from "@/components/Graphs/ProgressOverview";
import { getData } from "@/core/api/apiHandler";
import { analyticsRoute } from "@/core/api/apiRoutes";
import { Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

export default function Client() {
  const { data: getClientAnalyticsData, isLoading } = useQuery({
    queryKey: ["get-client-analytics"],
    queryFn: async () => {
      return await getData(analyticsRoute.getClientAnalytics, {});
    },
  });

  console.log("clinet Analytics Data", getClientAnalyticsData);
  const result = getClientAnalyticsData?.data?.data ?? 0;

  const statuses = [
    "New",
    "InProgress",
    "Ready and Packed",
    "Partially Dispatched",
    "Dispatched",
    "Preponed",
    "Cancelled",
  ];

  //get dummy value for each status
  const deliveryStatusData = statuses.map((status) => ({
    name: status,
    value: Math.floor(Math.random() * 50) + 1,
  }));

  if (isLoading) {
    return (
      <div className="flex flex-row items-center justify-center h-[80vh]">
        <Spinner />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-4 w-full">
        <h1 className="font-bold text-3xl p-2">Analytics Dashboard</h1>
        <div className="parent-div flex flex-row justify-center space-x-4 items-center">
          <div className="left-div  w-1/2 grid grid-cols-2 gap-4 p-2">
            <AnalyticsCard
              title1="Total POs"
              value1={result.totalPODataCount}
              title2="value"
              value2={new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(result.totalPODatavalue.totalValue || 0)}
            />
            <AnalyticsCard
              title1="Total Line Items"
              value1={result.lineItemData.totalLineItem}
              title2="Open Line Items"
              value2={result.lineItemData.openLineItem}
            />
            <AnalyticsCard
              title1="Open POs"
              value1={result.openPOData.openCount}
              title2="Value"
              value2={new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(result.openPOData.openPOValue || 0)}
            />
            <AnalyticsCard
              title1="Line Items Dispatched"
              value1={result.dispatchedLIData.count || 0}
              title2="Value"
              value2={new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(result.dispatchedLIData.value || 0)}
            />
          </div>
          <div className="right-div w-1/2 grid grid-cols-2 gap-4 p-2 ">
            <AnalyticsGraphCard
              title="Progress Overview"
              chart={<DeliveryStatusPieChart data={deliveryStatusData} />}
            />
            <AnalyticsGraphCard
              title="OTD Graph"
              chart={<OTDGaugeChart percentage={85} />}
            />
          </div>
        </div>
      </div>
    );
  }
}
