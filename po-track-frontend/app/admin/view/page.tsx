"use client";

import ShowTableData from "@/components/ShowTableData";
import { getData } from "@/core/api/apiHandler";
import { poRoutes } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function POView() {
  const [page, setPage] = useState<number>(1);
  const {
    data: getPos,
    isFetched: isFetchedGetPos,
    isFetching: isFetchingGetPos,
  } = useQuery({
    queryKey: ["getPos", page],
    queryFn: () => {
      return getData(`${poRoutes.viewPo}${page}/5`, {});
    },
  });
  const [pages, setPages] = useState<number>(0);
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (isFetchedGetPos) {
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
      name: "Order Date",
    },
    {
      name: "Purchase Action",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <h1>View Purchase Orders</h1>
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
