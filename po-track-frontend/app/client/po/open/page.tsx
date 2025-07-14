"use client";
import { queryClient } from "@/app/providers";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import CustomModal from "@/components/Modal/CustomModal";
import { getData, postData } from "@/core/api/apiHandler";
import { progressUpdate } from "@/core/api/apiRoutes";
import {
  Card,
  CardHeader,
  Table,
  TableColumn,
  TableHeader,
  Select,
  SelectItem,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Button,
  useDisclosure,
  Input,
} from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OpenPo() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<any>("");
  const {
    data: getOpenPo,
    isFetched: isFetched,
    isFetching: isFetchingOpenPo,
  } = useQuery({
    queryKey: ["getOpenPo", status],
    queryFn: () => {
      return getData(`${progressUpdate.getClientOpenPo}?status=${status}`, {});
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const queryStatus = searchParams.get("status");

    if (queryStatus) {
      let formattedStatus = "";

      if (queryStatus.toLowerCase() === "inprogress") {
        formattedStatus = "InProgress";
      } else if (queryStatus.toLowerCase() === "ready for inspection") {
        formattedStatus = "Ready for Inspection";
      }

      setStatus(formattedStatus);
    }
  }, [searchParams]);

  const deliveryStatusStyles: Record<string, string> = {
    New: "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md shadow-blue-400",
    InProgress:
      "bg-gradient-to-r from-indigo-400 to-indigo-600 text-white shadow-md shadow-indigo-400",
    "Ready and Packed":
      "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-md shadow-yellow-400",
    "Ready for Inspection":
      "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md shadow-amber-400",
    "QD Approved":
      "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md shadow-green-400",
    "QD Rejected":
      "bg-gradient-to-r from-red-400 to-red-600 text-white shadow-md shadow-red-400",
    "Cleared for Shipping":
      "bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-md shadow-teal-400",
    "Delivery on Hold":
      "bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-md shadow-gray-400",
    "Defer Delivery":
      "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md shadow-orange-400",
    CIPLUnderReview:
      "bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-md shadow-purple-400",
    CIPLReviewedAndRejected:
      "bg-gradient-to-r from-rose-400 to-rose-600 text-white shadow-md shadow-rose-400",
    CIPLReviewedAndSubmittedToADM:
      "bg-gradient-to-r from-pink-400 to-pink-600 text-white shadow-md shadow-pink-400",
    CIPLUnderADMReview:
      "bg-gradient-to-r from-fuchsia-400 to-fuchsia-600 text-white shadow-md shadow-fuchsia-400",
    AwaitingPickUp:
      "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow-md shadow-cyan-400",
    Shortclosed:
      "bg-gradient-to-r from-lime-400 to-lime-600 text-black shadow-md shadow-lime-400",
    PartiallyDispatched:
      "bg-gradient-to-r from-sky-400 to-sky-600 text-white shadow-md shadow-sky-400",
    Dispatched:
      "bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-400",
    Preponed:
      "bg-gradient-to-r from-violet-400 to-violet-600 text-white shadow-md shadow-violet-400",
    "On Hold":
      "bg-gradient-to-r from-zinc-400 to-zinc-600 text-white shadow-md shadow-zinc-400",
    Deffered:
      "bg-gradient-to-r from-stone-400 to-stone-600 text-white shadow-md shadow-stone-400",
    Cancelled:
      "bg-gradient-to-r from-red-500 to-red-700 text-white shadow-md shadow-red-500",
  };

  useEffect(() => {
    if (isFetched) {
      setData(getOpenPo?.data.data);
    }
  }, [isFetched]);
  const [tableLineItemHeaders, setTableHeaders] = useState<any>([
    { key: "lineItem", name: "Line Item" },
    { key: "partNumber", name: "Part Number" },
    { key: "exw_date", name: "EXW Date" },
    { key: "date_required", name: "Date Required" },
    { key: "line_item_type", name: "Line Item Type" },
    { key: "quantity", name: "Quantity" },
    { key: "Open_Qty", name: "Open Qty" },
    { key: "supplier", name: "Supplier" },
    { key: "rm_tracker", name: "RM Tracker" },
    { key: "up_details", name: "UP Details" },
    { key: "usp_details", name: "USP Details" },
    { key: "ssn", name: "Supplier Readliness Date" },
    { key: "progress_tracker", name: "Progress Tracker" },
    { key: "delivery_status", name: "Delivery Status" },
  ]);

  useEffect(() => {
    if (localStorage.getItem("ROLE") !== "SUPPLIER") {
      setTableHeaders((prev: any) => {
        const alreadyExists = prev.some(
          (header: any) => header.key === "action",
        );

        if (!alreadyExists) {
          return [...prev, { key: "action", name: "Action" }];
        }
        return prev;
      });
    }
  }, []);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const deliveryStatusOptions = Object.keys(deliveryStatusStyles).map(
    (key) => ({
      key,
      label: key,
    }),
  );

  const [selectedLi, setSelectedLi] = useState<any>({});
  const statusStyles: Record<string, string> = {
    on_track:
      "bg-gradient-to-r text-center from-green-400 to-green-600 text-sm text-white shadow-md shadow-green-500 uppercase",
    "not-started":
      "bg-gradient-to-r text-center text-sm from-gray-300 to-gray-500 text-black shadow-md shadow-gray-400 uppercase",
    "on-track":
      "bg-gradient-to-r text-center from-green-400 to-green-600 text-sm text-white shadow-md shadow-green-500 uppercase",
    delayed:
      "bg-gradient-to-r text-center from-red-400 to-red-600 text-sm text-white shadow-md shadow-red-500 uppercase",
  };
  const [lidata, setliData] = useState<any>();
  const handleSet = (e: string, key: string) => {
    console.log(e, key);
    setliData((prev: any) => ({
      ...prev,
      [key]: key === "date_required" ? new Date(e) : e,
    }));
  };

  const addUpdate = useMutation({
    mutationKey: ["addUpdate"],
    mutationFn: (id: any) => {
      return postData(
        `${progressUpdate.clientLineItem}${id}`,
        {},
        { data: lidata },
      );
    },
    onSuccess: (data: any) => {
      console.log(data, "data");
      toast.success("Line Item Updated", {
        position: "top-right",
        className: "bg-green-500",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      toast.error("Line Item Updation Failed", {
        position: "top-right",
      });
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
  const getValue = (item: any, key: any) => {
    const feedBackTracker = item?.feed_back_tracker ?? [];

    switch (key) {
      case "Progress Tracker":
        return (
          <Chip className={statusStyles[item.progressTracker]}>
            {item.progressTracker}
          </Chip>
        );
      case "UP Details":
        if (item?.underProcess) {
          return (
            // <div>
            //   <p>
            //     {
            //       new Date(item.underSpecialProcess?.actualDate)
            //         .toLocaleString()
            //         .split(",")[0]
            //     }
            //   </p>
            // </div>
            <Tooltip
              content={
                <div className="w-[200px] h-[50px] items-center rounded-full">
                  {item?.underProcess ? (
                    <div className="flex flex-col gap-4 cursor-pointer items-center">
                      <p className="flex flex-row gap-4 justify-center items-center">
                        <span>Actual Date</span>
                        <span>
                          {
                            new Date(item?.underProcess?.actualDate)
                              .toLocaleString()
                              .split(",")[0]
                          }
                        </span>
                      </p>
                      <p className="flex  flex-row gap-4 justify-center items-center">
                        <span>Plan Date</span>
                        <span>
                          {
                            new Date(item?.underProcess?.planDate)
                              .toLocaleString()
                              .split(",")[0]
                          }
                        </span>
                      </p>
                    </div>
                  ) : (
                    <Chip>Not Started</Chip>
                  )}
                </div>
              }
            >
              <Chip size="sm" color="primary">
                View Dates
              </Chip>
            </Tooltip>
          );
        } else {
          return <Chip color="danger">Not Started</Chip>;
        }
      case "UP Actual Date":
        if (item?.underProcess) {
          return (
            <p>
              {
                new Date(item.underProcess?.actualDate)
                  .toLocaleString()
                  .split(",")[0]
              }
            </p>
          );
        } else {
          return <p>Not Started</p>;
        }
      case "Line Item Type":
        return <p>{item.LI.line_item_type}</p>;
      case "UP Plan Date":
        if (item?.underProcess) {
          return (
            <p>
              {
                new Date(item.underProcess?.planDate)
                  .toLocaleString()
                  .split(",")[0]
              }
            </p>
          );
        } else {
          return <p>Not Started</p>;
        }
      case "USP Plan Date":
        if (item?.underSpecialProcess) {
          return (
            <p>
              {
                new Date(item.underSpecialProcess?.planDate)
                  .toLocaleString()
                  .split(",")[0]
              }
            </p>
          );
        } else {
          return <p>Not Started</p>;
        }
      case "USP Actual Date":
        if (item?.underSpecialProcess) {
          return (
            <p>
              {
                new Date(item.underSpecialProcess?.actualDate)
                  .toLocaleString()
                  .split(",")[0]
              }
            </p>
          );
        } else {
          return <p>Not Started</p>;
        }
      case "RM Plan Date":
        if (item?.rawMaterial) {
          return (
            <p className={statusStyles[item?.rawMaterial?.RMtracker]}>
              {
                new Date(item?.rawMaterial?.planDate)
                  .toLocaleString()
                  .split(",")[0]
              }
            </p>
          );
        } else {
          return <p className={statusStyles["not-started"]}>Not Started</p>;
        }
      case "RM Actual Date":
        if (item?.rawMaterial) {
          return (
            <p className={statusStyles[item.rawMaterial.RMtracker]}>
              {
                new Date(item?.rawMaterial?.actualDate)
                  .toLocaleString()
                  .split(",")[0]
              }
            </p>
          );
        } else {
          return <p className={statusStyles["not-started"]}>Not Started</p>;
        }
      case "USP Details":
        if (item?.underSpecialProcess) {
          return (
            // <div>
            //   <p>
            //     {
            //       new Date(item.underSpecialProcess?.actualDate)
            //         .toLocaleString()
            //         .split(",")[0]
            //     }
            //   </p>
            // </div>
            <Tooltip
              content={
                <div className="flex flex-row w-[100px] h-[100px] items-center rounded-full">
                  {item?.underSpecialProcess ? (
                    <div className="flex flex-col gap-4 cursor-pointer items-center">
                      <p>
                        Actual Date{" "}
                        {
                          new Date(item?.underSpecialProcess?.actualDate)
                            .toLocaleString()
                            .split(",")[0]
                        }
                      </p>
                      <p>
                        Plan Date
                        {
                          new Date(item?.underSpecialProcess?.planDate)
                            .toLocaleString()
                            .split(",")[0]
                        }
                      </p>
                    </div>
                  ) : (
                    <Chip>Not Started</Chip>
                  )}
                </div>
              }
            >
              <Chip size="sm" color="primary">
                View Dates
              </Chip>
            </Tooltip>
          );
        } else {
          return <Chip color="danger">Not Started</Chip>;
        }
      case "RM Tracker":
        if (item?.rawMaterial) {
          return (
            <Tooltip
              content={
                <div className="flex flex-row w-[100px] h-[100px] items-center rounded-full">
                  {item?.rawMaterial ? (
                    <div className="flex flex-col gap-4 cursor-pointer items-center">
                      <p className={statusStyles[item.rawMaterial.RMtracker]}>
                        Actual Date{" "}
                        {
                          new Date(item?.rawMaterial?.actualDate)
                            .toLocaleString()
                            .split(",")[0]
                        }
                      </p>
                      <p className={statusStyles[item.rawMaterial.RMtracker]}>
                        Plan Date
                        {
                          new Date(item?.rawMaterial?.planDate)
                            .toLocaleString()
                            .split(",")[0]
                        }
                      </p>
                    </div>
                  ) : (
                    <p className={statusStyles["not-started"]}>Not Started</p>
                  )}
                </div>
              }
            >
              <Chip
                size="sm"
                className={
                  statusStyles[item.rawMaterial?.RMtracker ?? "not-started"]
                }
              >
                {item.rawMaterial?.RMtracker ?? "Not Started"}
              </Chip>
            </Tooltip>
          );
        } else {
          return (
            <Chip size="sm" className={statusStyles["not-started"]}>
              Not Started
            </Chip>
          );
        }
      case "Line Item":
        return <p>{item.LI.name}</p>;
      case "Part Number":
        return (
          <Tooltip
            className="bg-blue-500"
            content={`${item.LI.partNumber?.description}`}
          >
            <p className="cursor-pointer">{item.LI.partNumber.name}</p>
          </Tooltip>
        );
      case "Description":
        return <p>{item.LI.partNumber.description}</p>;
      case "EXW Date":
        return (
          <p>{new Date(item.LI.exw_date).toLocaleString().split(",")[0]}</p>
        );
      case "Date Required":
        return (
          <p>
            {new Date(item.LI.date_required).toLocaleString().split(",")[0]}
          </p>
        );
      case "Quantity":
        return <p>{item.qty}</p>;
      case "Open Qty":
        return <p>{item.openqty}</p>;
      case "Supplier":
        return <p>{item.supplier.name}</p>;
      case "Supplier Readliness Date":
        return (
          <p>
            {
              new Date(item.LI.supplier_readliness_date)
                .toLocaleString()
                .split(",")[0]
            }
          </p>
        );
      case "Delivery Status":
        return (
          <Chip className={deliveryStatusStyles[item.delivery_status]}>
            {item.delivery_status}
          </Chip>
        );
      case "Action":
        const isTrue = () => {
          if (feedBackTracker.length > 0) {
            const length = feedBackTracker.length - 1;
            const response = feedBackTracker[length]?.response ?? null;
            console.log(response, "Response");
            if (response) {
              return true;
            } else {
              return false;
            }
          } else if (feedBackTracker.length === 0) {
            return true;
          }
        };

        return (
          <div className="flex flex-row gap-4 items-center">
            <Chip className={deliveryStatusStyles[item.delivery_status]}>
              {item?.LI?.line_item_status}
            </Chip>
            {feedBackTracker.length > 0 && (
              <Chip className="bg-red-400">
                {feedBackTracker.length} Changes
              </Chip>
            )}
            {item.delivery_status !== "Shortclosed" &&
              item.delivery_status != "Dispatched" && (
                <Button
                  color="primary"
                  size="sm"
                  isDisabled={!isTrue()}
                  onPress={() => {
                    onOpen();
                    setSelectedLi(item);
                  }}
                >
                  Update
                </Button>
              )}
          </div>
        );
      default:
        return <h1>Rohan</h1>;
    }
  };
  const line_item_status = [
    {
      key: "Preponed",
      label: "Preponed",
    },
    {
      key: "On Hold",
      label: "On Hold",
    },
    {
      key: "Deffered",
      label: "Deffered",
    },
    {
      key: "Cancelled",
      label: "Cancelled",
    },
  ];

  if (isFetchingOpenPo) {
    return (
      <div className="flex flex-col gap-4 w-full items-center p-4">
        {Array.from({ length: 15 }).map((_: any, index: number) => {
          return <BomLoadingCardSkeleton key={index} />;
        })}
      </div>
    );
  } else {
    return (
      <>
        <div className="flex flex-col items-center gap-4">
          <Select
            onChange={(e) => setStatus(e.target.value)}
            className="w-1/4 flex flex-row items-start p-3"
            label="Select an Line Item Status"
            selectedKeys={[status]}
          >
            {deliveryStatusOptions.map((animal) => (
              <SelectItem key={animal.key}>{animal.label}</SelectItem>
            ))}
          </Select>
          {data.length === 0 ? (
            <div className="text-center text-gray-500 mt-8 text-xl font-bold">
              <h1>No open purchase orders found.</h1>
            </div>
          ) : (
            data.map((d: any, _: any) => {
              const purchaseOrder = d.purchaseOrder;
              const lineItems: any = d?.progressUpdates;

              return (
                <div className="flex flex-col w-full gap-4 p-6" key={d.poId}>
                  <Card className="flex w-full flex-row shadow-xl">
                    <CardHeader className="flex flex-row w-full items-center gap-4 px-4">
                      <h1>{purchaseOrder.name}</h1>
                      <h1>
                        Order Date{" "}
                        {
                          new Date(purchaseOrder.order_date)
                            .toLocaleString()
                            .split(",")[0]
                        }
                      </h1>
                      <h1>Freight Term {purchaseOrder?.freight_term?.name}</h1>
                      <h1>Payment Term {purchaseOrder?.payment_term?.name}</h1>
                    </CardHeader>
                  </Card>
                  <Table>
                    <TableHeader columns={tableLineItemHeaders}>
                      {(column: { name: string }) => (
                        <TableColumn key={column.name}>
                          {column.name}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody items={lineItems}>
                      {(item: any) => (
                        <TableRow key={item._id}>
                          {(columnKey) => (
                            <TableCell>{getValue(item, columnKey)}</TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              );
            })
          )}
        </div>

        <CustomModal
          onOpenChange={onOpenChange}
          isOpen={isOpen}
          heading="View Line Item Status"
          bottomContent={
            <div className="flex items-center">
              <Button color="danger">Close</Button>
            </div>
          }
        >
          <form
            onSubmit={(e: any) => addUpdate.mutate(selectedLi?._id)}
            className="flex flex-col items-center w-full gap-4"
          >
            <span className="flex flex-row items-center">
              <h1>Current Line Item Status : </h1>
              <Chip>{selectedLi?.LI?.line_item_status}</Chip>
            </span>
            <Select
              onChange={(e) => handleSet(e.target.value, "status")}
              className="max-w-xs"
              label="Select an Line Item Status"
            >
              {line_item_status.map((animal: any) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
            {lidata &&
              lidata.status !== "On Hold" &&
              lidata.status !== "Cancelled" && (
                <Input
                  type="date"
                  label="New Date Required"
                  value={
                    lidata.date_required &&
                    !isNaN(new Date(lidata.date_required).getTime())
                      ? new Date(lidata.date_required)
                          .toISOString()
                          .substring(0, 10)
                      : ""
                  }
                  onChange={(e) => handleSet(e.target.value, "date_required")}
                  className="max-w-sm"
                />
              )}

            <Button color="primary" isLoading={isLoading} type="submit">
              Submit
            </Button>
          </form>
        </CustomModal>
      </>
    );
  }
}
