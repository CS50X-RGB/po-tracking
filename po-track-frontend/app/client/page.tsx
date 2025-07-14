"use client";
import AnalyticsCard from "@/components/Card/AnalyticsCard";
import AnalyticsGraphCard from "@/components/Card/AnalyticsGraphCars";
import OTDGaugeChart from "@/components/Graphs/OTDGaugeChart";
import DeliveryStatusPieChart from "@/components/Graphs/ProgressOverview";
import { getData } from "@/core/api/apiHandler";
import { analyticsRoute, masterRoutes } from "@/core/api/apiRoutes";
import { Select, SelectItem, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Client() {
  const [year, setYear] = useState<any>("NULL");
  const [supplier, setSupplier] = useState<any>("NULL");
  const { data: getClientAnalyticsData, isFetching: isLoading } = useQuery({
    queryKey: ["get-client-analytics", supplier, year],
    queryFn: async () => {
      return await getData(
        `${analyticsRoute.getClientAnalytics}?supplier=${supplier}&year=${year}`,
        {},
      );
    },
  });

  const result = getClientAnalyticsData?.data?.data ?? 0;

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

  const { data: getSuppliers } = useQuery({
    queryKey: ["getSuppliers"],
    queryFn: () => {
      return getData(`${masterRoutes.getSupplier}?search=`, {});
    },
  });

  const years = [
    {
      key: String(new Date().getFullYear()),
      label: String(new Date().getFullYear()),
    },
    {
      key: String(new Date().getFullYear() - 1),
      label: String(new Date().getFullYear() - 1),
    },
    {
      key: String(new Date().getFullYear() - 2),
      label: String(new Date().getFullYear() - 2),
    },
  ];
  let suppliersData = [];

  if (isLoading) {
    return (
      <div className="flex flex-row items-center justify-center h-[80vh]">
        <Spinner />
      </div>
    );
  } else {
    suppliersData = getSuppliers?.data?.data?.data ?? [];

    return (
      <div className="flex flex-col gap-4 w-full">
        <h1 className="font-bold text-3xl p-2">Analytics Dashboard</h1>
        <div className="flex flex-row items-center gap-4">
          <Select
            onChange={(e) => setYear(e.target.value)}
            className="max-w-xs"
            label="Select Year"
            selectedKeys={[year.toString()]}
          >
            {years.map((animal: any) => (
              <SelectItem key={animal.key}>{animal.label}</SelectItem>
            ))}
          </Select>
          <Select
            onChange={(e) => setSupplier(e.target.value)}
            className="max-w-xs"
            label="Select Suppliers"
            selectedKeys={[supplier.toString()]}
          >
            {suppliersData.map((animal: any) => (
              <SelectItem key={animal._id}>{animal.name}</SelectItem>
            ))}
          </Select>
        </div>
        <div className="parent-div flex flex-row justify-center space-x-4 items-center">
          <div className="left-div  w-1/2 grid grid-cols-2 gap-4 p-2">
            <AnalyticsCard
              title1="Total POs"
              href1="/admin/po/view"
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
              href1="/admin/po/li/"
              value1={result.lineItemData.totalLineItem}
              title2="Open Line Items"
              value2={result.lineItemData.openLineItem}
            />
            <AnalyticsCard
              title1="Open POs"
              href1="/admin/po/openPO"
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
              href1="/admin/po/dispatchedLI"
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
              chart={
                <OTDGaugeChart
                  supplier={supplier}
                  year={year}
                  percentage={result.avgOTD}
                />
              }
            />
          </div>
        </div>
      </div>
    );
  }
}
