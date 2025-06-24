"use client";
import { getData, postData } from "@/core/api/apiHandler";
import {
  masterRoutes,
  partNumbersRoutes,
  poRoutes,
} from "@/core/api/apiRoutes";
import { Query, useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import PurchaseOrderCard from "@/components/Card/PurchaseOrderCard";
import CustomModal from "@/components/Modal/CustomModal";
import SearchInput from "@/components/AutoComplete";
import { useState } from "react";
import { toast } from "sonner";
import { queryClient } from "@/app/providers";

export default function ViewPo() {
  const { id } = useParams();
  const {
    data: getPoById,
    isFetching: isFetchingPo,
    isFetched: isFetchedPo,
  } = useQuery({
    queryKey: ["getPoByid", id],
    queryFn: () => {
      return getData(`${poRoutes.singlePo}/${id}`, {});
    },
  });
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [linteItem, setLineItem] = useState<any>({});
  const [isLoading, setisLoading] = useState<boolean>(false);
  const addLineItem = useMutation({
    mutationKey: ["addLineItem"],
    mutationFn: (data: any) => {
      return postData(`${poRoutes.addLineItem}/${id}`, {}, data);
    },
    onSettled: () => {
      setisLoading(false);
    },
    onMutate: () => {
      setisLoading(true);
    },
    onSuccess: (data: any) => {
      console.log(data.data, "Data");
      toast.success("Line Item Added");
      onClose();
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.error("Error", error);
    },
  });
  const line_item_status = [
    {
      key: "FAI",
      label: "FAI",
    },
    {
      key: "Production",
      label: "Production",
    },
  ];
  const handleSet = (e: any, type: any) => {
    console.log(type, e, "Value");
    setLineItem((prev: any) => ({
      ...prev,
      [type]:
        type === "date_required" || type === "order_date" ? new Date(e) : e,
    }));
  };

  return (
    <>
      <div className="flex flex-col gap-5 p-5">
        <PurchaseOrderCard po={getPoById} />
        <Button
          onPress={onOpen}
          size="md"
          className="font-bold w-40"
          color="primary"
        >
          Add Line Item
        </Button>
        <div className="flex flex-wrap flex-row w-full p-5 gap-4">
          {getPoById?.data?.data?.lineItem.length > 0 &&
            getPoById?.data?.data?.lineItem.map((d: any, index: number) => {
              return (
                <Card key={index} className="w-1/3 h-full p-10 font-bold">
                  <CardHeader className="flex flex-row gap-4">
                    <Chip className="rounded-full" color="primary">
                      {d.name}
                    </Chip>
                    <Chip color="warning">{d.priority}</Chip>
                    <h1>Part Number: {d?.partNumber?.name ?? "N/A"}</h1>
                    <Chip color="primary">{d.line_item_status}</Chip>
                  </CardHeader>
                  <CardBody className="flex flex-col items-start">
                    <div className="flex flex-col gap-4">
                      <p>Currency {d.currency}</p>
                      <Chip color="warning">
                        Unit Of Measurement {d.uom.name}
                      </Chip>
                      <Chip color="secondary">{d.line_item_type}</Chip>
                      <p className="flex flex-row items-center gap-2">
                        <span>Supplier:</span>
                        <span>{d?.supplier?.name ?? "N/A"}</span>
                      </p>
                      <p>Unit Cost: ₹{d?.unit_cost ?? "N/A"}</p>
                      <p>Total Cost: ₹{d?.total_cost ?? "N/A"}</p>
                      <p>Quantity: {d?.qty ?? "N/A"}</p>
                      <p>
                        Ex Works Date:{" "}
                        {d?.exw_date
                          ? new Date(d.exw_date).toLocaleDateString()
                          : "Not Available"}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
        </div>
      </div>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpen}
        heading="Add Line Item"
        bottomContent={
          <div className="flex flex-row">
            <Button onPress={onClose} color="danger">
              Close
            </Button>
          </div>
        }
      >
        <form
          onSubmit={() => addLineItem.mutate(linteItem)}
          className="flex flex-col gap-4"
        >
          <Input
            label="Name"
            type="number"
            onValueChange={(e) => handleSet(e, "name")}
            value={linteItem.unit_cost}
          />
          <SearchInput
            label="Part Number"
            api={`${partNumbersRoutes.searchByPart}`}
            type="partNumber"
            state={linteItem.partNumber}
            setState={handleSet}
          />
          <SearchInput
            label="Supplier"
            api={`${masterRoutes.getSupplier}`}
            type="supplier"
            state={linteItem.supplier}
            setState={handleSet}
          />
          <Input
            label="Unit Cost"
            type="number"
            onValueChange={(e) => handleSet(e, "unit_cost")}
            value={linteItem.unit_cost}
          />
          <Input
            label="Currency"
            type="text"
            onValueChange={(e) => handleSet(e, "currency")}
            value={linteItem.currency}
          />
          <Input
            label="Quantity"
            type="number"
            onValueChange={(e) => handleSet(e, "qty")}
            value={linteItem.qty}
          />
          <Input
            type="date"
            label="Date Required"
            value={
              linteItem.date_required
                ? new Date(linteItem.date_required)
                    .toISOString()
                    .substring(0, 10)
                : ""
            }
            onChange={(e) => handleSet(e.target.value, "date_required")}
            isRequired
            className="max-w-md"
          />
          <Input
            type="date"
            label="Order Date"
            value={
              linteItem.order_date
                ? new Date(linteItem.order_date).toISOString().substring(0, 10)
                : ""
            }
            onChange={(e) => handleSet(e.target.value, "order_date")}
            isRequired
            className="max-w-md"
          />
          <Select
            onChange={(e) => handleSet(e.target.value, "line_item_type")}
            className="max-w-xs"
            label="Select an Line Item Status"
          >
            {line_item_status.map((animal) => (
              <SelectItem key={animal.key}>{animal.label}</SelectItem>
            ))}
          </Select>
          <Button color="primary" type="submit">
            Add Line Item
          </Button>
        </form>
      </CustomModal>
    </>
  );
}
