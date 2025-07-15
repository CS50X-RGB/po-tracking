"use client";

import PageViewComponent from "@/components/PageViewComponent";
import { poRoutes } from "@/core/api/apiRoutes";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewOpenLi() {
  const route = poRoutes.viewOpenPOSupplier;
  const [year, setYear] = useState<any>("NULL");
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("year")) {
      setYear(params.get("year"));
    }
  }, []);
  const columnHeaders = [
    {
      name: "Purchase Order Name",
    },
    {
      name: "Client Name",
    },
    {
      name: "Client Branch Name",
    },
    {
      name: "Payment Terms",
    },
    // {
    //   name: "Freight Terms",
    // },
    {
      name: "Order Date",
    },
    {
      name: "Purchase Action",
    },
  ];

  return (
    <PageViewComponent
      columnHeaders={columnHeaders}
      heading="View Open Purchase Order"
      queryKey={["get-open-po-data", year]}
      route={route}
      params={[{ key: "year", value: year }]}
    />
  );
}
