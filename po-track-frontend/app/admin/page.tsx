"use client";

import React from "react";

import CustomTable from "@/components/CustomTable";
import { getData } from "@/core/api/apiHandler";
import {
  accountRoutes,
  analyticsRoute,
  masterRoutes,
} from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import AnalyticsCard from "@/components/Card/AnalyticsCard";
import AnalyticsGraphCard from "@/components/Card/AnalyticsGraphCars";
import OTDGaugeChart from "@/components/Graphs/OTDGaugeChart";
import DeliveryStatusPieChart from "@/components/Graphs/ProgressOverview";

export default function Page() {
  const [page, setPage] = useState<number>(1);
  const [year, setYear] = useState<any>("NULL");
  const [supplier, setSupplier] = useState<any>("NULL");
  const [total, setTotal] = useState<number>(1);

  const {
    data: getAllUsers,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ["get-all-users", page],
    queryFn: async () => {
      return await getData(
        `${accountRoutes.allUsers}/?page=${page}&offset=5`,
        {},
      );
    },
  });

  const { data: getSuppliers } = useQuery({
    queryKey: ["getSuppliers"],
    queryFn: () => {
      return getData(`${masterRoutes.getSupplier}?search=`, {});
    },
  });

  //get analyticsRoutes
  const {
    data: getAnalyticsData,
    isLoading,
    isFetched: isFetchedAnalytics,
  } = useQuery({
    queryKey: ["get-analytics", supplier, year],
    queryFn: async () => {
      return await getData(
        `${analyticsRoute.getAdminAnalytics}?supplier=${supplier}&year=${year}`,
        {},
      );
    },
  });

  useEffect(() => {
    if (isFetched) {
      setTotal(Math.ceil(getAllUsers?.data.data.count / 5));
    }
  });
  const result = getAnalyticsData?.data?.data ?? null;

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

  if (isFetching || isLoading) {
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
              href1={`/admin/po/view?year=${year}&supplier=${supplier}`}
              value1={result.totalPOCount}
              title2="Value"
              value2={new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(result.totalPOValue.totalValue || 0)}
            />
            <AnalyticsCard
              title1="Total Line Items"
              href1={`/admin/po/li?year=${year}&supplier=${supplier}`}
              value1={result.lineItemData.totalLineItem}
              title2="Open Line Items"
              href2={`/admin/po/openLI?year=${year}&supplier=${supplier}`}
              value2={result.lineItemData.openLineItem}
            />
            <AnalyticsCard
              title1="Open POs"
              href1={`/admin/po/openPO?year=${year}&supplier=${supplier}`}
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
              href1={`/admin/po/dispatchedLI?year=${year}&supplier=${supplier}`}
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
            {isFetchedAnalytics && (
              <AnalyticsGraphCard
                title="Progress Overview"
                chart={<DeliveryStatusPieChart data={deliveryStatusData} />}
              />
            )}
            <AnalyticsGraphCard
              title="OTD Graph"
              chart={
                <OTDGaugeChart
                  supplier={supplier}
                  year={year}
                  percentage={result.otd}
                />
              }
            />
          </div>
        </div>
        <h1 className="font-bold text-xl">View Users</h1>
        <CustomTable
          data={getAllUsers?.data.data.users}
          loadingState={isFetching}
          page={page}
          setPage={setPage}
          pages={total}
        />
      </div>
    );
  }
}
