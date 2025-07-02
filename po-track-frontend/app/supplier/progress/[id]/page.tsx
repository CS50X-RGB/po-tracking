"use client";

import { queryClient } from "@/app/providers";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import ProgressUpdateModal from "@/components/ProgressUpdateModal";
import { getData, putData } from "@/core/api/apiHandler";
import { progressUpdate as routes } from "@/core/api/apiRoutes";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Badge,
  CardFooter,
  Button,
  Input,
  SelectItem,
  Select,
} from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PageProgress() {
  const { id } = useParams();
  const {
    data: getSingleProgress,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ["getSingleProgress"],
    queryFn: () => {
      return getData(`${routes.getSingleProgress}${id}`, {});
    },
  });

  const [state, setState] = useState<any>({});
  const handleSet = (e: string, key: string) => {
    setState((prev: any) => ({
      ...prev,
      [key]: key === "dispatched_date" ? new Date(e) : e,
    }));
  };
  const line_item_status = [
    {
      key: "Shortclosed",
      label: "Shortclosed",
    },
    {
      key: "PartiallyDispatched",
      label: "PartiallyDispatched",
    },
  ];
  const updateFinalStatus = useMutation({
    mutationKey: ["updateFinalStatus"],
    mutationFn: (id: any) => {
      return putData(`${routes.dispatchLineItem}${id}`, {}, state);
    },
    onSuccess: (data: any) => {
      toast.success("Updated Final Status of the Line Item");
      queryClient.invalidateQueries({ queryKey: ["getSingleProgress"] });
    },
    onError: (error: any) => {
      toast.error("Error while updating the line item");
    },
  });

  if (isFetching) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <BomLoadingCardSkeleton key={index} />
        ))}
      </div>
    );
  } else {
    const purchaseOrder = getSingleProgress?.data?.data?.purchaseOrder ?? [];
    const progressUpdate = getSingleProgress?.data?.data?.progressUpdates ?? [];

    return (
      <div className="flex flex-col gap-4 w-full p-4">
        <Card className="bg-blue-600/10">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-row items-start gap-4">
              <h1 className="font-bold">
                Purchase Order {purchaseOrder?.name}
              </h1>
              <h1>
                Order Date{" "}
                {
                  new Date(purchaseOrder?.order_date)
                    .toLocaleString()
                    .split(",")[0]
                }
              </h1>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-row gap-4 items-center">
                <h1>Frieght Terms </h1>
                <Chip color="primary">{purchaseOrder?.freight_term?.name}</Chip>
              </div>
              <div className="flex flex-row gap-4 items-center">
                <h1>Payment Term </h1>
                <Chip color="primary">{purchaseOrder?.payment_term?.name}</Chip>
              </div>
            </div>
          </CardHeader>
        </Card>
        <h1 className="text-2xl font-bold mb-4">Line Items</h1>

        <div className="space-y-4">
          {progressUpdate.map((item: any, index: number) => {
            console.log(item, "status");
            const lineItem = item?.LI;
            const rm = item?.rawMaterial;
            const up = item?.underProcess;
            const fi = item?.finalInspection;
            const usp = item?.underSpecialProcess;
            const cipl = item?.cipl;

            return (
              <Card
                key={index}
                className="p-4 w-full shadow-md text-white rounded-xl"
              >
                <CardBody className="flex flex-row flex-wrap gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row flex-wrap gap-4">
                      <h2 className="flex flex-row gap-4 text-lg font-semibold">
                        <span>Line Item</span>
                        <span>{lineItem?.name}</span>
                      </h2>
                      <div className="flex flex-row gap-4">
                        <h2 className="flex flex-row gap-4 text-lg">
                          <span>Part Number</span>
                          {lineItem?.partNumber?.name}
                        </h2>
                        <h2 className="flex flex-row gap-4 text-lg">
                          <span>Description</span>
                          {lineItem?.partNumber?.description}
                        </h2>
                      </div>
                      <div className="flex flex-row gap-4">
                        <h2 className="flex flex-row gap-4 text-lg">
                          <span>EXW Date</span>
                          {
                            new Date(lineItem?.exw_date)
                              .toLocaleString()
                              .split(",")[0]
                          }
                        </h2>
                      </div>
                      <div className="flex flex-row gap-4 font-semibold items-center">
                        <h1>Quantity {item?.qty}</h1>
                        <h1>Open Qty {item?.openqty}</h1>
                      </div>
                      <div className="flex flex-row gap-4">
                        <h2 className="flex flex-row gap-4 text-lg">
                          <span>Supplier Readliness Date</span>
                          {
                            new Date(lineItem?.supplier_readliness_date)
                              .toLocaleString()
                              .split(",")[0]
                          }
                        </h2>
                      </div>
                      {(item.delivery_status === "Dispatched" ||
                        item.delivery_status === "Shortclosed") && (
                        <div className="flex flex-row gap-4">
                          <h2 className="flex flex-row gap-4 text-lg">
                            <span>Dispatched Date</span>
                            {new Date(
                              item?.dispatched_date,
                            ).toLocaleDateString()}
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-end w-full">
                    <Chip
                      size="lg"
                      className="p-2 shadow-xl shadow-blue-800"
                      color="secondary"
                    >
                      {item.delivery_status}
                    </Chip>
                  </div>
                </CardBody>
                <CardFooter className="flex flex-col gap-4 w-full items-start">
                  <div className="flex flex-row items-start w-full gap-4">
                    {rm ? (
                      <div className="flex gap-4 p-3 flex-col bg-blue-800/10 rounded-xl justify-between items-center">
                        <div className="flex flex-row items-center p-4 gap-4">
                          <h1
                            className={`px-3 py-1 rounded-full text-xs font-semibold
                            ${
                              rm.RMtracker !== "delayed"
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            Threshold Date{" "}
                            {new Date(
                              rm?.thresholdDate,
                            ).toLocaleDateString()}{" "}
                          </h1>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold
                              ${
                                rm.RMtracker !== "delayed"
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                          >
                            {rm.RMtracker !== "delayed"
                              ? "🟢 On Track"
                              : "🔴 Delayed"}
                          </span>
                        </div>
                        <ProgressUpdateModal
                          type="RM"
                          puId={item?._id}
                          qty={item?.qty - item?.dispatchedQty}
                          value={rm}
                          apiRoute={routes.manageRm}
                          status={item.delivery_status}
                        />
                      </div>
                    ) : (
                      <ProgressUpdateModal
                        type="RM"
                        puId={item?._id}
                        qty={item?.qty - item?.dispatchedQty}
                        value={rm}
                        apiRoute={routes.manageRm}
                      />
                    )}

                    {rm && (
                      <ProgressUpdateModal
                        type="UP"
                        puId={item?._id}
                        qty={item?.qty - item?.dispatchedQty}
                        value={up}
                        apiRoute={routes.manageUp}
                        status={item.delivery_status}
                      />
                    )}
                    {rm && (
                      <ProgressUpdateModal
                        type="USP"
                        puId={item?._id}
                        qty={item?.qty - item?.dispatchedQty}
                        value={usp}
                        apiRoute={routes.manageUsp}
                        status={item.delivery_status}
                      />
                    )}
                    {rm &&
                      (up || usp) &&
                      (fi ? (
                        <div className="flex flex-col items-center bg-blue-800/10 rounded-xl p-3">
                          <div className="flex flex-row"></div>
                          <div className="flex flex-row items-center p-4 gap-4">
                            <h1
                              className={`px-3 py-1 rounded-full text-xs font-semibold
                              ${
                                fi.inspectionTracker !== "delayed"
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              Threshold Date{" "}
                              {new Date(
                                fi.inspectionThreshHoldDate,
                              ).toLocaleDateString()}{" "}
                            </h1>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold
                                ${
                                  fi.inspectionTracker !== "delayed"
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                            >
                              {fi.inspectionTracker !== "delayed"
                                ? "🟢 On Track"
                                : "🔴 Delayed"}
                            </span>
                          </div>
                          <ProgressUpdateModal
                            type="FI"
                            puId={item?._id}
                            qty={item?.qty - item?.openqty}
                            value={fi}
                            apiRoute={routes.manageFi}
                            status={item.delivery_status}
                          />
                        </div>
                      ) : (
                        <ProgressUpdateModal
                          type="FI"
                          puId={item?._id}
                          qty={item?.qty - item?.openqty}
                          value={fi}
                          apiRoute={routes.manageFi}
                        />
                      ))}

                    {!["New", "InProgress", "Ready for Inspection"].includes(
                      item.delivery_status,
                    ) && (
                      <ProgressUpdateModal
                        type="CIPL"
                        puId={item?._id}
                        qty={item?.qty - item?.openqty}
                        value={cipl}
                        apiRoute={routes.manageCIPL}
                        status={item.delivery_status}
                      />
                    )}
                  </div>
                  <div className="flex flex-row items-start w-1/2">
                    {item.delivery_status === "AwaitingPickUp" && (
                      <div className="flex flex-row gap-4 items-center w-3/4">
                        <Input
                          type="date"
                          value={
                            state?.dispatched_date
                              ? new Date(state.dispatched_date)
                                  .toISOString()
                                  .slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            handleSet(e.target.value, "dispatched_date")
                          }
                          label="Dispatched Date"
                          isRequired
                          className="w-[300px]"
                        />
                        {Number(item.qty) !== Number(item.dispatchedQty) && (
                          <Select
                            onChange={(e) =>
                              handleSet(e.target.value, "status")
                            }
                            className="w-[300px]"
                            label="Select Line Item Status"
                          >
                            {line_item_status.map((animal) => (
                              <SelectItem key={animal.key}>
                                {animal.label}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                        {state?.dispatched_date && (
                          <Button
                            onPress={() => updateFinalStatus.mutate(item._id)}
                            color="primary"
                          >
                            Submit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
}
