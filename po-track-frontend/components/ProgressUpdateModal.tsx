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

export default function ProgressUpdateModal({
  type,
  qty,
  puId,
  apiRoute,
  value,
}: {
  type: "RM" | "UP" | "USP" | "FI";
  qty: any;
  puId: any;
  apiRoute: any;
  value: any;
}) {
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
  const [state, setState] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      toast.success("Rm Added", {
        position: "top-right",
      });
      queryClient.invalidateQueries();
      onClose();
    },
    onError: (error: any) => {
      console.error(error, "error");
      toast.error("Error while RM Update", {
        position: "top-right",
      });
      onClose();
    },
  });
  const handleSet = (field: string, value: any) => {
    setState((prev: any) => ({
      ...prev,
      [field]:
        field == "planDate" || field == "actualDate" ? new Date(value) : value,
    }));
  };

  useEffect(() => {
    if (type == "RM") {
      if (value) {
        handleSet("planDate", value.planDate);
        handleSet("actualDate", value.actualDate);
        handleSet("soruce", value.soruce);
        handleSet("inStock", value.inStock);
      }
      handleSet("recieved", qty);
    }

    if (type == "UP") {
      if (value) {
        handleSet("planDate", value.planDate);
        handleSet("actualDate", value.actualDate);
        handleSet("type", value.type);
        handleSet("completedQuantity", value.completedQuantity);
      }
      handleSet("pendingQuantity", qty);
    }
  }, [type]);

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
            <Select
              onChange={(e) => handleSet("RMstatus", e.target.value)}
              className="max-w-xs"
              label="Select RM Status"
            >
              {rm_status.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
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
              selectedKeys={[state.source]}
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
            <Select
              onChange={(e) => handleSet("UPstatus", e.target.value)}
              className="max-w-xs"
              label="Select UP Status"
            >
              {up_status.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
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

  return (
    <>
      <Button className="bg-green-500" onPress={onOpen}>
        {" "}
        <span>Update {type}</span>
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
