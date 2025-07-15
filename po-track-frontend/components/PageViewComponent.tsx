"use client";

import ShowTableData from "@/components/ShowTableData";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Param = {
  key: string;
  value: string | number;
};

export default function PageViewComponent({
  route,
  columnHeaders,
  queryKey,
  heading,
  params = [],
}: {
  route: string;
  columnHeaders: { name: string }[];
  queryKey: any;
  heading: string;
  params?: Param[];
}) {
  const [page, setPage] = useState<number>(1);

  // Convert params array to query string
  const queryString = params
    .map(
      (param) =>
        `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`,
    )
    .join("&");

  const finalRoute = queryString
    ? `${route}${page}/10?${queryString}`
    : `${route}${page}/10`;

  const {
    data: getInfo,
    isFetched: isFetchedGetPos,
    isFetching: isFetchingGetPos,
  } = useQuery({
    queryKey: [queryKey, page, ...params.map((p) => `${p.key}-${p.value}`)],
    queryFn: () => getData(finalRoute, {}),
  });

  const [pages, setPages] = useState<number>(0);
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (isFetchedGetPos) {
      const { data, total } = getInfo?.data.data;
      setData(data);
      setPages(Math.ceil(total / 10));
    }
  }, [isFetchingGetPos]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="font-bold text-2xl">{heading}</h1>
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
