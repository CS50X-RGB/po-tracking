"use client";
import PageViewComponent from "@/components/PageViewComponent";
import { poRoutes } from "@/core/api/apiRoutes";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViweOpenLi() {
  const route = poRoutes.viewOpenLI;
  const [year, setYear] = useState<any>("NULL");
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("year")) {
      setYear(params.get("year"));
    }
  }, [year]);

  const coloumnHeaders = [
    {
      name: "Name",
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
      heading="View Open Line Items"
      queryKey={["get-open-li", year]}
      route={route}
      params={[{ key: "year", value: year }]}
    />
  );
}
