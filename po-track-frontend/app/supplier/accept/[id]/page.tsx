"use client";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import LineItemAccept from "@/components/Card/LineItemAccept";
import CustomModal from "@/components/Modal/CustomModal";
import { getData, putData } from "@/core/api/apiHandler";
import { poRoutes } from "@/core/api/apiRoutes";
import { Button, Input, useDisclosure } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AcceptedPurchaseOrder() {
  const { id } = useParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const {
    data: getLineItems,
    isFetching: isFetchingLineItems,
    isFetched: isFetchedLineItems,
  } = useQuery({
    queryKey: ["getLineItem", id],
    queryFn: () => getData(`${poRoutes.notAcceptedLi}${id}`, {}),
  });
  const [linetemId, setlineItemId] = useState<any>();
  const router = useRouter();
  const updateLineItem = useMutation({
    mutationKey: ["updateLineItem"],
    mutationFn: (data: any) => {
      return putData(`${poRoutes.acceptedLi}${linetemId}`, {}, data);
    },
    onSuccess: (data: any) => {
      console.log(data);
      toast.success("Line Item Accepted", {
        position: "top-right",
      });
      router.push("/supplier/accept");
    },
    onSettled: () => {
      setisLoading(false);
    },
    onMutate: () => {
      setisLoading(true);
    },
    onError: (data: any) => {
      console.log(data, "error");
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
            <LineItemAccept
              onClick={() => {
                setlineItemId(d._id);
                onOpen();
              }}
              d={d}
              key={index}
            />
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateLineItem.mutate(li);
            }}
            className="flex flex-col gap-4 p-5"
          >
            <Input
              type="text"
              onValueChange={(e) => handleSet(e, "ssn")}
              label="Serial Number"
            />
            <Input
              type="date"
              label="Supplier Readliness Date"
              value={
                li.supplier_readliness_date
                  ? new Date(li.supplier_readliness_date)
                      .toISOString()
                      .substring(0, 10)
                  : ""
              }
              onChange={(e) =>
                handleSet(e.target.value, "supplier_readliness_date")
              }
              isRequired
              className="max-w-md"
            />
            <Button isLoading={isLoading} color="primary" type="submit">
              Submit
            </Button>
          </form>
        </div>
      </CustomModal>
    </>
  );
}
