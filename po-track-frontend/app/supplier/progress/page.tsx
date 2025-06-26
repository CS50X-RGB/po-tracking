"use client";
import { useQuery } from "@tanstack/react-query";
import { progressUpdate } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { Card, CardHeader, CardBody } from "@heroui/react";

export default function ProgressUpdate() {
  const { data: getProgressUpdate, isFetching } = useQuery({
    queryKey: ["progress_update"],
    queryFn: () => getData(progressUpdate.getAllProgress, {}),
  });

  const pus = getProgressUpdate?.data?.data ?? [];

  if (isFetching) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <BomLoadingCardSkeleton key={index} />
        ))}
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-4 p-4">
        {pus.length === 0 ? (
          <p className="text-white">No progress updates found.</p>
        ) : (
          pus.map((pu: any, index: number) => {
            const li = pu.LI;
            const po = li?.purchaseOrder;

            return (
              <Card key={index} className="bg-gray-900 text-white">
                <CardHeader className="text-lg font-semibold">
                  Line Item: {li?.name ?? "N/A"}
                </CardHeader>
                <CardBody>
                  <p>
                    <strong>PO Name:</strong> {po?.name ?? "N/A"}
                  </p>
                  <p>
                    <strong>EXW Date:</strong>{" "}
                    {li?.exw_date
                      ? new Date(li.exw_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Freight Term:</strong>{" "}
                    {po?.freight_term?.name ?? "N/A"}
                  </p>
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {po?.order_date
                      ? new Date(po.order_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
    );
  }
}
