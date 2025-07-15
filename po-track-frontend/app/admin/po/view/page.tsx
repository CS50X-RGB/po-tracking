"use client";

import ShowTableData from "@/components/ShowTableData";
import { getData } from "@/core/api/apiHandler";
import { poRoutes } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function POView() {
  const [year, setYear] = useState<any>("NULL");
  const params = useSearchParams();
  const [supplier, setSupplier] = useState<any>("NULL");
  const [fetching, setFetching] = useState<boolean>(false);

  useEffect(() => {
    if (params.get("year")) {
      setYear(params.get("year"));
    }
    if (params.get("supplier")) {
      setSupplier(params.get("supplier"));
    }
    setFetching(true);
  }, [params]);

  const [page, setPage] = useState<number>(1);
  const {
    data: getPos,
    isFetched: isFetchedGetPos,
    isFetching: isFetchingGetPos,
  } = useQuery({
    queryKey: ["getPos", page, year, supplier],
    queryFn: () => {
      return getData(
        `${poRoutes.viewPo}${page}/5?year=${year}&supplier=${supplier}`,
        {},
      );
    },
    enabled: fetching,
  });
  const [pages, setPages] = useState<number>(0);
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (isFetchedGetPos && fetching) {
      const { data, total } = getPos?.data.data;
      setData(data);
      const pages = Math.ceil(total / 5);
      setPages(pages);
    }
  }, [isFetchingGetPos]);

  const columnHeaders = [
    {
      name: "Purchase Order Name",
    },
    {
      name: "Client",
    },
    {
      name: "Client Branch Name",
    },
    {
      name: "Payment Terms",
    },
    {
      name: "Freight Terms",
    },
    {
      name: "Total PO Value",
    },
    {
      name: "Order Date",
    },
    {
      name: "Purchase Action",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">View Purchase Orders</h1>
      <ShowTableData
        page={page}
        columnHeaders={columnHeaders}
        data={data}
        pages={pages}
        setPage={setPage}
      />
    </div>
  );
}
