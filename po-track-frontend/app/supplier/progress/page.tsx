"use client";

import { useQuery } from "@tanstack/react-query";
import { progressUpdate } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { Card, CardHeader, CardBody, Chip, Button } from "@heroui/react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProgressUpdate() {
  const { data: getProgressUpdate, isFetching } = useQuery({
    queryKey: ["progress_update"],
    queryFn: () => getData(progressUpdate.getAllProgress, {}),
  });

  const pus = getProgressUpdate?.data?.data ?? [];

  const router = useRouter();

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
            const li = pu.progressUpdates;
            const po = pu?.purchaseOrder;

            return (
              <Card key={index} className="text-white">
                <CardHeader className="text-lg font-semibold items-center">
                  <div className="flex flex-row gap-4">
                    <h1>Purchase Order {po?.name ?? "N/A"}</h1>
                    <Chip color="primary">
                      {li.length} Line Items having progress
                    </Chip>
                  </div>
                </CardHeader>
                <CardBody className="flex flex-row items-center justify-between w-full">
                  <div className="flex flex-col gap-4 w-3/4">
                    <div className="flex flex-row gap-4">
                      <h1 className="bg-blue-500/30 px-4 rounded-full">
                        Payment Terms {po.payment_term.name}
                      </h1>
                      <h1 className="bg-sky-500/40 px-4 rounded-full">
                        Frieght Term {po.freight_term.name}
                      </h1>
                    </div>
                    <div className="flex flex-row gap-4">
                      <h1 className="bg-blue-500/30 px-4 rounded-full">
                        Client {po.client.name}
                      </h1>
                      <h1 className="bg-sky-500/40 px-4 rounded-full">
                        Client Branch {po.client_branch.name}
                      </h1>
                    </div>
                    <div className="flex flex-col gap-4 w-1/4">
                      <h1 className="bg-yellow-500/20 rounded-full text-center px-4">
                        Order Date{" "}
                        {new Date(po.order_date).toLocaleString().split(",")[0]}
                      </h1>
                    </div>
                  </div>
                  <Eye
                    onClick={() => router.push(`/supplier/progress/${po._id}`)}
                  />
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
    );
  }
}
