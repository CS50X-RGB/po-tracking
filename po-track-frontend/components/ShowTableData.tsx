import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Chip,
  Switch,
  useDisclosure,
  Button,
  Tooltip,
  Input,
} from "@heroui/react";

import { useMutation } from "@tanstack/react-query";
import Delete from "@/public/Icons/Delete";
import { deleteData, putData } from "@/core/api/apiHandler";
import {
  accountRoutes,
  partNumbersRoutes,
  poRoutes,
  progressUpdate,
} from "@/core/api/apiRoutes";
import { queryClient } from "@/app/providers";

import { toast } from "sonner";

import { CheckIcon } from "@/public/Icons/CheckIcon";
import CrossIcon from "@/public/Icons/CrossIcon";
import { useRouter } from "next/navigation";
import CustomModal from "./Modal/CustomModal";
import EyeIcon from "@/public/Icons/EyeIcon";
import { Check, MoveRight, X } from "lucide-react";

interface CustomTableProps {
  columnHeaders: {
    name: string;
  }[];
  page: number;
  pages: number;
  setPage: Dispatch<SetStateAction<number>>;
  loadingState?: any;
  data: any[];
}

export default function ShowTableData({
  columnHeaders,
  page,
  pages,
  setPage,
  loadingState,
  data,
}: CustomTableProps) {
  const deleteById = useMutation({
    mutationKey: ["deletebyId"],
    mutationFn: async (id: any) => {
      return await deleteData(`${accountRoutes.deleteById}/${id}`, {});
    },
    onSuccess: (data: any) => {
      console.log(data.data);
      toast.success("User Deleted Successfully");
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Error caused while deleting user");
    },
  });
  const deleteByIdPo = useMutation({
    mutationKey: ["deletePobyId"],
    mutationFn: async (id: any) => {
      return await deleteData(`${poRoutes.deletePo}/${id}`, {});
    },
    onSuccess: (data: any) => {
      console.log(data.data);
      toast.success("Po Deleted Successfully");
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Error caused while deleting po");
    },
  });

  const router = useRouter();
  const deleteByPartNumberId = useMutation({
    mutationKey: ["deletebyPartNumberId"],
    mutationFn: async (id: any) => {
      return await deleteData(`${partNumbersRoutes.deletePartById}/${id}`, {});
    },
    onSuccess: (data: any) => {
      console.log(data.data);
      toast.success("Part Number Deleted Successfully", {
        position: "top-right",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Error caused while deleting Part Number");
    },
  });
  const updateFeedBackById = useMutation({
    mutationKey: ["updateFeedBackById"],
    mutationFn: ({ id, response }: { id: any; response: string }) => {
      return putData(
        `${progressUpdate.approveFeedBackLineItem}${id}`,
        {},
        { data: { response } },
      );
    },
    onSuccess: (data: any) => {
      console.log(data.data);
      toast.success("Feedback Updated Successfully", {
        position: "top-right",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Error caused while updating Feedback");
    },
  });
  const updateBlockById = useMutation({
    mutationKey: ["updateBlockyId"],
    mutationFn: async (id: any) => {
      return await putData(`${accountRoutes.block}/${id}`, {}, {});
    },
    onSuccess: (data: any) => {
      console.log(data.data);
      toast.success("User Status Updated Successfully", {
        position: "top-right",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("Error caused while deleting user", {
        position: "top-right",
      });
    },
  });
  const [isLoadingPlanning, setisLoadingPlanning] = useState<boolean>(false);

  const roleColors: Record<
    string,
    "primary" | "warning" | "success" | "danger" | "default" | "secondary"
  > = {
    ADMIN: "primary",
    BIDDER: "warning",
    SELLER: "secondary",
  };
  const {
    isOpen: isOpenStatus,
    onOpen: onOpenStatus,
    onOpenChange: onOpenChangeStatus,
    onClose: onCloseStatus,
  } = useDisclosure();
  const {
    isOpen: isOpenRealse,
    onOpen: onOpenRealse,
    onOpenChange: onOpenChangeRealse,
    onClose: onCloseRealse,
  } = useDisclosure();
  const [item, setItem] = useState<any>({});
  const clickChip = (item: any) => {
    onOpenStatus();
    setItem(item);
    console.log(item, "Item");
  };
  const [qty, setQty] = useState<string>("0");
  const clickRelase = (item: any) => {
    onOpenRealse();
    setItem(item);
    setQty(item.qty);
  };
  const getValue = (item: any, columnKey: any): React.ReactNode => {
    console.log(item, "ITem");
    switch (columnKey) {
      case "role":
        return (
          <Chip color={roleColors[item.role.name] || "default"}>
            {item.role.name}
          </Chip>
        );
      case "Action":
        return (
          <Delete
            className={"size-4 fill-red-300 cursor-pointer"}
            onClick={() => deleteByPartNumberId.mutate(item._id)}
          />
        );
      case "Total PO Value":
        return <p>Rs {item.total_sum}</p>;
      case "Date Required Changes":
        if (item?.new_date_required_date) {
          return (
            <span className="flex flex-row gap-4 items-center">
              <Chip color="danger">
                {new Date(item.prev_date_required_date).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </Chip>
              <MoveRight />
              <Chip color="success">
                {new Date(item.new_date_required_date).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </Chip>
            </span>
          );
        } else {
          return <Chip>No Changes in Date</Chip>;
        }
      case "EXW Date Changes":
        if (item?.new_exw_date) {
          return (
            <span className="flex flex-row gap-4 items-center">
              <Chip color="danger">
                {new Date(item.prev_exw_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Chip>
              <MoveRight />
              <Chip color="success">
                {new Date(item.new_exw_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Chip>
            </span>
          );
        } else {
          return <Chip>No Changes in Date</Chip>;
        }
      case "Line Item Status Changes":
        if (item?.new_line_item_status) {
          return (
            <span className="flex flex-row gap-4 items-center">
              <Chip color="danger">{item.prev_line_item_status}</Chip>
              <MoveRight />
              <Chip color="success">{item.new_line_item_status}</Chip>
            </span>
          );
        } else {
          return <Chip>No Changes in Date</Chip>;
        }
      case "Supplier Readliness Date Changes":
        if (item?.new_supplier_readliness_date) {
          return (
            <span className="flex flex-row gap-4 items-center">
              <Chip color="danger">
                {new Date(
                  item.prev_supplier_readliness_date,
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Chip>
              <MoveRight />
              <Chip color="success">
                {new Date(item.new_supplier_readliness_date).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </Chip>
            </span>
          );
        } else {
          return <Chip>No Changes in Date</Chip>;
        }
      case "Freight Terms":
        return <p>{item.freight_term.name}</p>;
      case "Payment Terms":
        return <p>{item.payment_term.name}</p>;
      case "Sub Client Name":
      case "Supplier Name":
        return <p>{item.name}</p>;
      case "Line Item":
        return <p>{item.line_item.LI.name}</p>;
      case "Previous Line Item Status":
        return <Chip>{item.prev_line_item_status}</Chip>;
      case "New Line Item Status":
        return <Chip>{item.new_line_item_status}</Chip>;
      case "Exw Date":
        return <p>{item.exw_date} days</p>;
      case "Client Action":
        return (
          <EyeIcon
            className="size-4 fill-green-500"
            onClick={() => router.push(`/admin/master/${item._id}`)}
          />
        );
      case "Supplier Action":
        return (
          <EyeIcon
            className="size-4 fill-green-500"
            onClick={() => router.push(`/admin/master/supplier/${item._id}`)}
          />
        );
      case "Part Number":
        return <p>{item.partNumber.name}</p>;
      case "Total Cost":
        return <p>{Number(item.total_cost).toFixed(2)}</p>;
      case "EXW Date":
        return (
          <p>
            {new Date(item.exw_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        );
      case "FeedBack Action":
        return (
          <div className="flex flex-row items-center gap-4">
            <Button
              onPress={() =>
                updateFeedBackById.mutate({
                  response: "Yes",
                  id: item._id,
                })
              }
              color="success"
              isIconOnly
            >
              <Check />
            </Button>
            <Button
              onPress={() =>
                updateFeedBackById.mutate({
                  response: "No",
                  id: item._id,
                })
              }
              color="danger"
              isIconOnly
            >
              <X />
            </Button>
          </div>
        );
      case "Part Details":
        return (
          <Tooltip content={item.line_item.LI.partNumber.description}>
            <p>{item.line_item.LI.partNumber.name}</p>
          </Tooltip>
        );
      case "Unit Cost":
        return <p>{Number(item.unit_cost).toFixed(2)}</p>;
      case "Line Item Status":
        return <p>{item.line_item_status}</p>;
      case "Line Item Type":
        return <p>{item.line_item_type}</p>;
      case "Purchase Order":
        if (item?.purchaseOrder?.name) {
          return <p>{item?.purchaseOrder?.name}</p>;
        } else if (item?.line_item.LI?.purhcaseOrder) {
          return <p>{item?.line_item?.LI?.purchaseOrder?.name}</p>;
        } else {
          return <p>Line Item</p>;
        }
      case "Supplier":
        return <p>{item.supplier.name}</p>;
      case "action":
        return (
          <div className="flex flex-row gap-4 items-center w-full">
            <Delete
              className={"size-4 fill-red-300 cursor-pointer"}
              onClick={() => deleteById.mutate(item._id)}
            />
            {item.isBlocked === false ? (
              <Chip
                className="text-sm cursor-pointer"
                color="success"
                size="sm"
                startContent={<CheckIcon size={15} height={6} width={6} />}
                variant="faded"
                onClick={() => clickChip(item)}
              >
                Online
              </Chip>
            ) : (
              <Chip
                size="sm"
                onClick={() => clickChip(item)}
                className="text-sm cursor-pointer"
                color="danger"
                startContent={<CrossIcon height={6} size={15} width={6} />}
                variant="faded"
              >
                Blocked
              </Chip>
            )}
          </div>
        );
      case "In Stock Qty":
        return <p>{item["in_stock"]}</p>;
      case "Re Order Level":
        return <p>{item["reorder_qty"]}</p>;
      case "Top Level Assembly":
        return <p>{item.bomId.name}</p>;
      case "Top Level Name":
        return <p>{item.bomId.name}</p>;
      case "Quantity":
        return <p>{item.qty}</p>;
      case "Planning Status":
        return (
          <Chip color={item.status === "Locked" ? "primary" : "success"}>
            {item.status}
          </Chip>
        );
      case "Order Date":
        return <p>{new Date(item.order_date).toLocaleDateString()}</p>;
      case "Purchase Action":
        return (
          <div className="flex flex-row items-center gap-4">
            <EyeIcon
              onClick={() => router.push(`/admin/po/view/${item._id}`)}
              className="size-4"
            />
            <Delete
              className={"size-4 fill-red-300 cursor-pointer"}
              onClick={() => deleteByIdPo.mutate(item._id)}
            />
          </div>
        );
      case "Client":
        return <p>{item.client.name}</p>;
      case "Client Branch Name":
        return <p>{item.client_branch.name}</p>;
      case "Client Address":
      case "Supplier Address":
        return <p>{item.address}</p>;
      case "Client Name":
        return <p>{item.client.name}</p>;
      case "Client Branch Name":
        return <p>{item.client_branch.name}</p>;
      case "Payment Terms":
        return <p>{item.payment_term.name}</p>;
      case "Purchase Order Name":
        return <p>{item.name}</p>;
      case "Sub Supplier Name":
        return <p>{item.name}</p>;
      default:
        return (
          <p className="text-sm font-bold">{item[columnKey.toLowerCase()]}</p>
        );
    }
  };

  return (
    <>
      <Table
        aria-label="Example table with client async pagination"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
      >
        <TableHeader columns={columnHeaders}>
          {(column) => (
            <TableColumn key={column.name}>
              {column.name === "Bom_Action" ||
              column.name === "Client Action" ||
              column.name === "FeedBack Action" ||
              column.name === "Purchase Action"
                ? "Actions"
                : column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          emptyContent={"No items present here"}
          items={data ?? []}
          loadingContent={<Spinner />}
          loadingState={loadingState}
        >
          {(item) => (
            <TableRow key={item?._id || Math.random().toString()}>
              {(columnKey) => (
                <TableCell>{getValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CustomModal
        isOpen={isOpenStatus}
        onOpenChange={onOpenChangeStatus}
        heading="Update Status"
        bottomContent={
          <div className="flex p-2">
            <Button onPress={onCloseStatus} color="danger">
              Close
            </Button>
          </div>
        }
      >
        <div className="flex flex-col">
          <Switch
            onChange={() => updateBlockById.mutate(item._id)}
            value={item.isBlocked}
          >
            User Not Blocked
          </Switch>
        </div>
      </CustomModal>
    </>
  );
}
