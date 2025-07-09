"use client";
import AnalyticsCard from "@/components/Card/AnalyticsCard";
import AnalyticsGraphCard from "@/components/Card/AnalyticsGraphCars";
import OTDGaugeChart from "@/components/Graphs/OTDGaugeChart";
import DeliveryStatusPieChart from "@/components/Graphs/ProgressOverview";
import { getData } from "@/core/api/apiHandler";
import { analyticsRoute } from "@/core/api/apiRoutes";
import { Chip, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";

export default function Supplier() {
  const {
    data: getSupplierAnalyticsData,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ["get-supplier-analytics"],
    queryFn: async () => {
      return await getData(analyticsRoute.getSupplierAnalytics, {});
    },
  });

  console.log("Supplier Analytics Data", getSupplierAnalyticsData);
  const result = getSupplierAnalyticsData?.data?.data ?? 0;

  const deliveryStatusData = [
    {
      name: "Awaiting Pickup",
      value: result?.deliveryStatusData?.awaitingPickup || 0,
    },
    {
      name: "Ready and Packed",
      value: result?.deliveryStatusData?.readyAndPacked || 0,
    },
    { name: "Cancelled", value: result?.deliveryStatusData?.cancelled || 0 },
    {
      name: "Ready for Inspection",
      value: result?.deliveryStatusData?.readyForInspection || 0,
    },
    {
      name: "Inprogress",
      value: result?.deliveryStatusData?.inProgress || 0,
    },
  ];
  const statuses = [
    "New",
    "InProgress",
    "Ready and Packed",
    "Partially Dispatched",
    "Dispatched",
    "Preponed",
    "Cancelled",
  ];

  if (isLoading) {
    return (
      <div className="flex flex-row items-center justify-center h-[80vh]">
        <Spinner />
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row items-center w-full justify-between p-4">
          <h1 className="font-bold text-3xl p-2">Analytics Dashboard</h1>
          <Chip
            color="danger"
            size="md"
            endContent={<Bell size={18} />}
            variant="flat"
          >
            Need Attention {result.needAttention}
          </Chip>
        </div>
        <div className="parent-div flex flex-row justify-center space-x-4 items-center">
          <div className="left-div  w-1/2 grid grid-cols-2 gap-4 p-2">
            <AnalyticsCard
              title1="Total POs"
              value1={result.totalPOData.totalPOCount}
              title2="value"
              value2={new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(result.totalPOData.totalPOValue || 0)}
            />
            <AnalyticsCard
              title1="Total Line Items"
              href1="/supplier/li/all"
              value1={result.lineItemData.totalLineItem}
              title2="Open Line Items"
              href2="/supplier/li/open"
              value2={result.lineItemData.openLineItem}
            />
            <AnalyticsCard
              title1="Open POs"
              href1="/supplier/po/open"
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
              href1="/supplier/li/dispatched"
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
            {isFetched && (
              <AnalyticsGraphCard
                title="Progress Overview"
                chart={<DeliveryStatusPieChart data={deliveryStatusData} />}
              />
            )}
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
