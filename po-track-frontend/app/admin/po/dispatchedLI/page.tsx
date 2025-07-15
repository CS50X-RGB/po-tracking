"use client";
import PageViewComponent from "@/components/PageViewComponent";
import { poRoutes } from "@/core/api/apiRoutes";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViweOpenLi() {
  const route = poRoutes.viewDispatchedLI;
  const [year, setYear] = useState<any>("NULL");
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("year")) {
      setYear(params.get("year"));
    }
  }, [year]);

  const coloumnHeaders = [
    {
      name: "name",
    },
    {
      name: "Part Number",
    },
    {
      name: "EXW Date",
    },
    {
      name: "Total Cost",
    },

    {
      name: "Unit Cost",
    },
    {
      name: "Purchase Order",
    },
    {
      name: "Supplier",
    },
    {
      name: "Line Item Status",
    },
    {
      name: "Line Item Type",
    },
  ];

  return (
    <PageViewComponent
      columnHeaders={coloumnHeaders}
      heading="View Dispatched Line Items"
      queryKey={["get-dispatchedLI-data", year]}
      route={route}
      params={[{ key: "year", value: year }]}
    />
  );
}
