"use client";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { getData } from "@/core/api/apiHandler";
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
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function OpenPo() {
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
  const [data, setData] = useState<any>([]);

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

  const tableLineItemHeaders = [
    { key: "lineItem", name: "Line Item" },
    { key: "partNumber", name: "Part Number" },
    { key: "description", name: "Description" },
    { key: "exw_date", name: "EXW Date" },
    { key: "date_required", name: "Date Required" },
    { key: "line_item_type", name: "Line Item Type" },
    { key: "quantity", name: "Quantity" },
    { key: "Open_Qty", name: "Open Qty" },
    { key: "supplier", name: "Supplier" },
    { key: "rm_tracker", name: "RM Tracker" },
    { key: "rm_actual_date", name: "RM Actual Date" },
    { key: "rm_plan_date", name: "RM Plan Date" },
    { key: "up_plan_date", name: "UP Plan Date" },
    { key: "up_actual_date", name: "UP Actual Date" },
    { key: "usp_plan_date", name: "USP Plan Date" },
    { key: "usp_actual_date", name: "USP Actual Date" },
    { key: "ssn", name: "Supplier Readliness Date" },
    { key: "delivery_status", name: "Delivery Status" },
  ];

  const deliveryStatusOptions = Object.keys(deliveryStatusStyles).map(
    (key) => ({
      key,
      label: key,
    }),
  );
  const statusStyles: Record<string, string> = {
    "not-started":
      "bg-gradient-to-r text-center text-sm from-gray-300 to-gray-500 text-black shadow-md shadow-gray-400 uppercase",
    "on-track":
      "bg-gradient-to-r text-center from-green-400 to-green-600 text-sm text-white shadow-md shadow-green-500 uppercase",
    delayed:
      "bg-gradient-to-r text-center from-red-400 to-red-600 text-sm text-white shadow-md shadow-red-500 uppercase",
  };

  const getValue = (item: any, key: any) => {
    switch (key) {
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
      case "RM Tracker":
        if (item?.rawMaterial) {
          return (
            <Chip
              size="sm"
              className={statusStyles[item.rawMaterial.RMtracker]}
            >
              {item.rawMaterial.RMtracker}
            </Chip>
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
        return <p>{item.LI.partNumber.name}</p>;
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
      default:
        return <h1>Rohan</h1>;
    }
  };

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
                      <TableColumn key={column.name}>{column.name}</TableColumn>
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
    );
  }
}
