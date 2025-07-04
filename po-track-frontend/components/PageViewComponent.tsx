"use client";

import ShowTableData from "@/components/ShowTableData";
import { getData } from "@/core/api/apiHandler";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function PageViewComponent({
  route,
  columnHeaders,
  queryKey,
  heading,
}: {
  route: any;
  columnHeaders: {
    name: string;
  }[];
  queryKey: string;
  heading: any;
}) {
  const [page, setPage] = useState<number>(1);
  const {
    data: getInfo,
    isFetched: isFetchedGetPos,
    isFetching: isFetchingGetPos,
  } = useQuery({
    queryKey: [queryKey, page],
    queryFn: () => {
      return getData(`${route}${page}/10`, {});
    },
  });
  const [pages, setPages] = useState<number>(0);
  const [data, setData] = useState<any>([]);
  useEffect(() => {
    if (isFetchedGetPos) {
      const { data, total } = getInfo?.data.data;
      setData(data);
      const pages = Math.ceil(total / 10);
      setPages(pages);
    }
  }, [isFetchingGetPos]);

  return (
    <div className="flex flex-col gap-4">
      <h1>{heading}</h1>
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
