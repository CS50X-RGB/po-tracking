"use client";
import PageViewComponent from "@/components/PageViewComponent";
import { poRoutes } from "@/core/api/apiRoutes";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViweLi() {
  const route = poRoutes.viewLI;
  const [year, setYear] = useState<any>("NULL");
  const [supplier, setSupplier] = useState<any>("NULL");
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("year")) {
      setYear(params.get("year"));
    }
    if (params.get("supplier")) {
      setSupplier(params.get("supplier"));
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
      heading="View Line Items"
      queryKey={["get-li-data", year]}
      route={route}
      params={[
        { key: "year", value: year },
        { key: "supplier", value: supplier },
      ]}
    />
  );
}
