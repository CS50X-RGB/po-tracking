"use client";
import PageViewComponent from "@/components/PageViewComponent";
import { poRoutes } from "@/core/api/apiRoutes";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewOpenLi() {
  const route = poRoutes.viewOpenPo;
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
    {
      name: "Total PO Value",
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
      queryKey={["get-open-po-admin", year]}
      route={route}
      params={[
        { key: "year", value: year },
        {
          key: "supplier",
          value: supplier,
        },
      ]}
    />
  );
}
