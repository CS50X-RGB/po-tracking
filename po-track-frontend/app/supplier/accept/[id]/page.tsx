"use client";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import LineItemAccept from "@/components/Card/LineItemAccept";
import CustomModal from "@/components/Modal/CustomModal";
import { getData, putData } from "@/core/api/apiHandler";
import { poRoutes } from "@/core/api/apiRoutes";
import { Button, Input, useDisclosure } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function AcceptedPurchaseOrder() {
  const { id } = useParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    data: getLineItems,
    isFetching: isFetchingLineItems,
    isFetched: isFetchedLineItems,
  } = useQuery({
    queryKey: ["getLineItem", id],
    queryFn: () => getData(`${poRoutes.notAcceptedLi}${id}`, {}),
  });
  const updateLineItem = useMutation({
    mutationKey: ["updateLineItem"],
    mutationFn: (data: any) => {
      return putData(`${poRoutes.acceptedLi}${data._id}`, {}, data);
    },
    onSuccess: (data: any) => {
      console.log("data", data.data);
    },
    onError: (data: any) => {
      // console.log(error, "error");
    },
  });
  const [li, setli] = useState<any>({
    ssn: "",
    supplier_readliness_date: "",
  });

  if (isFetchingLineItems) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <BomLoadingCardSkeleton key={index} />
        ))}
      </div>
    );
  }
  const lineItems = getLineItems?.data?.data ?? [];
  const handleSet = (e: any, type: any) => {
    console.log(type, e, "Value");
    setli((prev: any) => ({
      ...prev,
      [type]: type === "supplier_readliness_date" ? new Date(e) : e,
    }));
  };
  return (
    <>
      <div className="flex flex-col gap-4 p-4 text-white">
        {lineItems.length > 0 ? (
          lineItems.map((d: any, index: number) => (
            <LineItemAccept onClick={onOpen} d={d} key={index} />
          ))
        ) : (
          <p>No unaccepted line items found.</p>
        )}
      </div>
      <CustomModal
        heading="Accept Line Item"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        bottomContent={
          <div className="flex flex-row gap-4">
            <Button onPress={onClose}>Close</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <form>
            <Input />
            <Input />
            <Button>Submit</Button>
          </form>
        </div>
      </CustomModal>
    </>
  );
}
