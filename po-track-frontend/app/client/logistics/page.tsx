"use client";

import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { getData } from "@/core/api/apiHandler";
import { progressUpdate } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LogisticsPage() {
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<any>(1);
  const [data, setData] = useState<any>([]);

  const {
    data: getLogistics,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ["logistics", page],
    queryFn: () => getData(`${progressUpdate.getLogisitcs}${page}/5`, {}),
  });

  useEffect(() => {
    if (isFetched) {
      const { total, logistics } = getLogistics?.data?.data ?? {};
      setTotalPage(Math.ceil(total / 5));
      setData(logistics ?? []);
      console.log(total, logistics, "Get Object");
    }
  }, [isFetching]);

  if (isFetching) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <BomLoadingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((d: any, index: number) => (
        <div
          className="flex flex-col gap-4 p-5 rounded-full bg-blue-500/20 shadow-xl"
          key={index}
        >
          <div className="flex flex-row gap-4 p-5">
            <h1 className="font-bold text-xl">
              {d.purchaseOrder?.name || "No LI name"}
            </h1>
            <h1 className="font-bold text-xl">Supplier {d.supplier.name}</h1>
          </div>
          <div className="flex flex-row gap-4 font-bold text-lg px-8">
            <h1>WMS Details</h1>
            <h1>WMS Ref No {d.wms.wmrefNo}</h1>
            <h1 className="uppercase">
              Mode Of Transport {d.wms.modeOfTransport}
            </h1>
            <h1>Forwarder Name {d.wms.forwarder}</h1>
          </div>
          <div className="flex flex-row gap-4 font-bold text-lg px-8">
            <h1>CIPL Details</h1>
            <h1>CIPL InvoiceNo {d.cipl.invoiceNo}</h1>
            <Link href={d.cipl.ciplDocumentLink}>
              CIPL Document {d.cipl.ciplDocumentLink.substring(0, 20)}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
