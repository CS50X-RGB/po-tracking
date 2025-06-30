import { useEffect, useState } from "react";

import CustomModal from "./Modal/CustomModal";
import { BadgePlus } from "lucide-react";
import {
  useDisclosure,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";

import { useMutation } from "@tanstack/react-query";

import { postData } from "@/core/api/apiHandler";

import { toast } from "sonner";
import { queryClient } from "@/app/providers";

export type DeliveryStatusType =
  | "New"
  | "InProgress"
  | "Ready and Packed"
  | "Ready for Inspection"
  | "QD Approved"
  | "QD Rejected"
  | "Cleared for Shipping"
  | "Delivery on Hold"
  | "Defer Delivery"
  | "CIPL Under Review"
  | "CIPL Reviewed and Rejected"
  | "CIPL Reviewed and Submitted To ADM"
  | "CIPL Under ADM Review"
  | "Awaiting Pickup"
  | "Shortclosed"
  | "Partially Dispatched"
  | "Dispatched"
  | "Preponed"
  | "On Hold"
  | "Deffered"
  | "Cancelled";

export default function ProgressUpdateModal({
  type,
  qty,
  puId,
  apiRoute,
  value,
  status,
}: {
  type: "RM" | "UP" | "USP" | "FI" | "CIPL";
  qty: any;
  puId: any;
  apiRoute: any;
  value: any;
  status?: DeliveryStatusType;
}) {
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
  const [state, setState] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //utility function to get the customize tost message
  function getToastMessage(type: string, isError: boolean = false) {
    const action = isError ? "Error while updating" : "Added successfully";
    switch (type) {
      case "RM":
        return isError ? "Error while updating RM" : "RM added successfully";
      case "UP":
        return isError ? "Error while updating UP" : "UP added successfully";
      case "USP":
        return isError ? "Error while updating USP" : "USP added successfully";
      case "FI":
        return isError ? "Error while updating FI" : "FI added successfully";
      default:
        return isError ? "Error occurred" : "Added successfully";
    }
  }

  const addEntity = useMutation({
    mutationKey: ["addEntity"],
    mutationFn: (data: any) => {
      return postData(`${apiRoute}${puId}`, {}, data);
    },
    onSettled: () => {
      setIsLoading(false);
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data: any) => {
      console.log(data, "Response");
      toast.success(getToastMessage(type), {
        position: "top-right",
      });
      queryClient.invalidateQueries();
      onClose();
    },
    onError: (error: any) => {
      console.error(error, "error");
      toast.error(`Error while ${type} Update`, {
        position: "top-right",
      });
      onClose();
    },
  });
  const handleSet = (field: string, value: any) => {
    if (field === "inStock") {
      setState((prev: any) => ({
        ...prev,
        recieved: qty - value,
        [field]: value,
      }));
    } else if (field === "completedQuantity") {
      setState((prev: any) => ({
        ...prev,
        pendingQuantity: qty - value,
        [field]: value,
      }));
    } else {
      setState((prev: any) => ({
        ...prev,
        [field]:
          field === "planDate" ||
          field === "actualDate" ||
          field === "ciplSubDateToClient"
            ? new Date(value)
            : value,
      }));
    }
  };

  useEffect(() => {
    if (type == "RM") {
      if (value) {
        handleSet("planDate", value.planDate);
        handleSet("actualDate", value.actualDate);
        handleSet("source", value.source);
        handleSet("inStock", value.inStock);
        handleSet("RMstatus", value.RMstatus);
      }
      handleSet("recieved", qty);
    }

    if (type == "UP") {
      if (value) {
        handleSet("planDate", value.planDate);
        handleSet("actualDate", value.actualDate);
        handleSet("type", value.type);
        handleSet("completedQuantity", value.completedQuantity);
        handleSet("UPstatus", value.UPstatus);
      }
      handleSet("pendingQuantity", qty);
    }
    if (type == "FI") {
      if (value) {
        handleSet("isQualityCheckCompleted", value.isQualityCheckCompleted);
        handleSet("QDLink", value.QDLink);
      }
    }
    if (type == "USP") {
      if (value) {
        handleSet("planDate", value.planDate);
        handleSet("actualDate", value.actualDate);
        handleSet("type", value.type);
        handleSet("completedQuantity", value.completedQuantity);
        handleSet("USPstatus", value.USPstatus);
      }
      handleSet("pendingQuantity", qty);
    }
    if (type == "CIPL") {
      if (value) {
        handleSet("isCiplReady", value.isCiplReady);
        handleSet("invoiceNo", value.invoiceNo);
        handleSet("ciplSubDateToClient", value.ciplSubDateToClient);
        handleSet("ciplDocumentLink", value.ciplDocumentLink);
        handleSet("dispatchedQty", value.dispatchedQty);
      }
    }
  }, [type]);
  console.log("state", state.UPstatus);
  console.log("value", value);
  const getModalInfo = () => {
    const rm_source = [
      {
        key: "local",
        label: "Local",
      },
      {
        key: "imported",
        label: "Imported",
      },
    ];
    const rm_status = [
      {
        key: "open",
        label: "Open",
      },
      {
        key: "in-transist",
        label: "In-Transit",
      },
      {
        key: "partial-received",
        label: "Partially Recived",
      },
      {
        key: "received",
        label: "Recieved",
      },
    ];

    const up_type = [
      {
        key: "in-house",
        label: "In House",
      },
      {
        key: "outsourced",
        label: "Outsourced",
      },
    ];

    const final_type = [
      {
        key: "yes",
        label: "Yes",
      },
      {
        key: "no",
        label: "No",
      },
    ];

    const up_status = [
      {
        key: "open",
        label: "Open",
      },
      {
        key: "in-progress",
        label: "InProgress",
      },
      {
        key: "partially-completed",
        label: "Partially Completed",
      },
      {
        key: "completed",
        label: "Completed",
      },
    ];

    const usp_type = [
      {
        key: "in-house",
        label: "In House",
      },
      {
        key: "outsourced",
        label: "Outsourced",
      },
    ];

    const usp_status = [
      {
        key: "open",
        label: "Open",
      },
      {
        key: "in-progress",
        label: "InProgress",
      },
      {
        key: "partially-completed",
        label: "Partially Completed",
      },
      {
        key: "completed",
        label: "Completed",
      },
    ];

    switch (type) {
      case "RM":
        return (
          <form
            className="flex flex-col gap-4 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              addEntity.mutate(state);
            }}
          >
            <Select
              onChange={(e) => handleSet("source", e.target.value)}
              className="max-w-xs"
              selectedKeys={[state.source]}
              label="Select RM Source"
            >
              {rm_source.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
            <Input
              value={state.inStock}
              min={0}
              max={Number(qty)}
              onValueChange={(e) => handleSet("inStock", e)}
              label="In Stock"
            />
            <Input
              value={state.recieved}
              label="RM to Receive"
              isReadOnly={true}
            />
            <Input
              type="date"
              label="RM Plan Date"
              value={
                state.planDate
                  ? new Date(state.planDate).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => handleSet("planDate", e.target.value)}
              isRequired
              className="max-w-md"
            />
            <Input
              type="date"
              label="RM Actual Date"
              value={
                state.actualDate
                  ? new Date(state.actualDate).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => handleSet("actualDate", e.target.value)}
              isRequired
              className="max-w-md"
            />
            {state.RMstatus ? (
              <Select
                onChange={(e) => handleSet("RMstatus", e.target.value)}
                className="max-w-xs"
                selectedKeys={[state.RMstatus.toString()]}
                label="Select RM Status"
              >
                {rm_status.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            ) : (
              <Select
                onChange={(e) => handleSet("RMstatus", e.target.value)}
                className="max-w-xs"
                label="Select RM Status"
              >
                {rm_status.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            )}
            <Button
              isLoading={isLoading}
              type="submit"
              color="primary"
              className="mt-4"
            >
              Submit
            </Button>
          </form>
        );
      case "UP":
        return (
          <form
            className="flex flex-col gap-4 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              addEntity.mutate(state);
            }}
          >
            <Select
              onChange={(e) => handleSet("type", e.target.value)}
              className="max-w-xs"
              selectedKeys={[state.type]}
              label="Select UP type"
            >
              {up_type.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
            <Input
              value={state.completedQuantity}
              onValueChange={(e) => handleSet("completedQuantity", e)}
              label="Completed Quantity"
            />
            <Input
              value={state.pendingQuantity}
              label="Pending Quantity"
              isReadOnly={true}
            />
            <Input
              type="date"
              label="UP Plan Date"
              value={
                state.planDate
                  ? new Date(state.planDate).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => handleSet("planDate", e.target.value)}
              isRequired
              className="max-w-md"
            />
            <Input
              type="date"
              label="UP Actual Date"
              value={
                state.actualDate
                  ? new Date(state.actualDate).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => handleSet("actualDate", e.target.value)}
              isRequired
              className="max-w-md"
            />
            {state.UPstatus ? (
              <Select
                onChange={(e) => handleSet("UPstatus", e.target.value)}
                className="max-w-xs"
                selectedKeys={[state?.UPstatus]}
                label="Select UP Status"
              >
                {up_status.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            ) : (
              <Select
                onChange={(e) => handleSet("UPstatus", e.target.value)}
                className="max-w-xs"
                label="Select UP Status"
              >
                {up_status.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            )}
            <Button
              isLoading={isLoading}
              type="submit"
              color="primary"
              className="mt-4"
            >
              Submit
            </Button>
          </form>
        );
      case "USP":
        return (
          <form
            className="flex flex-col gap-4 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              addEntity.mutate(state);
            }}
          >
            <Select
              onChange={(e) => handleSet("type", e.target.value)}
              className="max-w-xs"
              selectedKeys={[state.type]}
              label="Select USP type"
            >
              {usp_type.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
            <Input
              value={state.completedQuantity}
              onValueChange={(e) => handleSet("completedQuantity", e)}
              label="Completed Quantity"
            />
            <Input
              value={state.pendingQuantity}
              label="Pending Quantity"
              isReadOnly={true}
            />
            <Input
              type="date"
              label="USP Plan Date"
              value={
                state.planDate
                  ? new Date(state.planDate).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => handleSet("planDate", e.target.value)}
              isRequired
              className="max-w-md"
            />
            <Input
              type="date"
              label="USP Actual Date"
              value={
                state.actualDate
                  ? new Date(state.actualDate).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => handleSet("actualDate", e.target.value)}
              isRequired
              className="max-w-md"
            />
            {state.USPstatus ? (
              <Select
                onChange={(e) => handleSet("USPstatus", e.target.value)}
                className="max-w-xs"
                selectedKeys={[state.USPstatus]}
                label="Select USP Status"
              >
                {usp_status.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            ) : (
              <Select
                onChange={(e) => handleSet("USPstatus", e.target.value)}
                className="max-w-xs"
                label="Select USP Status"
              >
                {usp_status.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            )}

            <Button
              isLoading={isLoading}
              type="submit"
              color="primary"
              className="mt-4"
            >
              Submit
            </Button>
          </form>
        );
      case "FI":
        return (
          <form
            className="flex flex-col gap-4 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              addEntity.mutate(state);
            }}
          >
            {state.isQualityCheckCompleted ? (
              <Select
                onChange={(e) =>
                  handleSet("isQualityCheckCompleted", e.target.value)
                }
                className="max-w-xs"
                selectedKeys={[state.isQualityCheckCompleted.toString()]}
                label="Is Quality Checked?"
              >
                {final_type.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            ) : (
              <Select
                onChange={(e) =>
                  handleSet("isQualityCheckCompleted", e.target.value)
                }
                className="max-w-xs"
                label="Is Quality Checked?"
              >
                {final_type.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            )}
            <Input
              value={state.QDLink}
              onValueChange={(e) => handleSet("QDLink", e)}
              label="Quality Document Link"
            />
            <Button
              isLoading={isLoading}
              type="submit"
              color="primary"
              className="mt-4"
            >
              Submit
            </Button>
          </form>
        );
      case "CIPL":
        return (
          <form
            className="flex flex-col gap-4 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              addEntity.mutate(state);
            }}
          >
            {state.isCiplReady ? (
              <Select
                isRequired={true}
                onChange={(e) => handleSet("isCiplReady", e.target.value)}
                className="max-w-xs"
                selectedKeys={[state.isCiplReady.toString()]}
                label="Is CIPL Ready?"
              >
                {final_type.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            ) : (
              <Select
                isRequired={true}
                onChange={(e) => handleSet("isCiplReady", e.target.value)}
                className="max-w-xs"
                label="Is CIPL Ready?"
              >
                {final_type.map((animal) => (
                  <SelectItem key={animal.key}>{animal.label}</SelectItem>
                ))}
              </Select>
            )}
            <Input
              isRequired={true}
              value={state.invoiceNo}
              onValueChange={(e) => handleSet("invoiceNo", e)}
              label="Invoice No"
            />
            <Input
              isRequired={true}
              value={state.ciplDocumentLink}
              onValueChange={(e) => handleSet("ciplDocumentLink", e)}
              label="CIPL Document Link"
            />
            <Input
              isRequired={true}
              value={state.dispatchedQty}
              onValueChange={(e) => handleSet("dispatchedQty", e)}
              label="Quantity Dispatched"
            />
            <Input
              type="date"
              label="Submission Date To Client"
              value={
                state.ciplSubDateToClient
                  ? new Date(state.ciplSubDateToClient)
                      .toISOString()
                      .substring(0, 10)
                  : ""
              }
              onChange={(e) => handleSet("ciplSubDateToClient", e.target.value)}
              isRequired
              className="max-w-md"
            />
            <Button
              isLoading={isLoading}
              type="submit"
              color="primary"
              className="mt-4"
            >
              Submit
            </Button>
          </form>
        );
      default:
        return null;
    }
  };
  console.log(status);
  const isDisabled = (): boolean => {
    switch (status) {
      case "Ready for Inspection":
      case "Ready and Packed":
        return true;
      default:
        return false;
    }
  };

  return (
    <>
      <Button
        isDisabled={isDisabled()}
        className="bg-green-500"
        onPress={onOpen}
      >
        {" "}
        <span>
          {value ? "Update" : "Add"} {type}
        </span>
        <BadgePlus size={20} />
      </Button>
      <CustomModal
        heading={`Update ${type}`}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        bottomContent={
          <div className="flex flex-row gap-2">
            <Button variant="solid" onClick={onClose}>
              Close
            </Button>
          </div>
        }
      >
        {getModalInfo()}
      </CustomModal>
    </>
  );
}
