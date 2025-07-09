"use client";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import LineItemAccept from "@/components/Card/LineItemAccept";
import CustomModal from "@/components/Modal/CustomModal";
import { getData, putData } from "@/core/api/apiHandler";
import { poRoutes } from "@/core/api/apiRoutes";
import { Button, Checkbox, Input, useDisclosure } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function AcceptedPurchaseOrder() {
  const { id } = useParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [li, setLi] = useState<any>({
    ssn: "",
    supplier_readliness_date: "",
  });
  const [lineItemId, setLineItemId] = useState<any>();
  const [selectedLineItem, setSelectedLineItem] = useState<any>(null);
  const router = useRouter();

  const { data: getLineItems, isFetching: isFetchingLineItems } = useQuery({
    queryKey: ["getLineItem", id],
    queryFn: () => getData(`${poRoutes.notAcceptedLi}${id}`, {}),
  });

  const updateLineItem = useMutation({
    mutationKey: ["updateLineItem"],
    mutationFn: (data: any) => {
      return putData(`${poRoutes.acceptedLi}${lineItemId}`, {}, data);
    },
    onSuccess: () => {
      toast.success("Line Item Accepted", {
        position: "top-right",
      });
      router.push("/supplier/accept");
    },
    onSettled: () => {
      setIsLoading(false);
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onError: (err: any) => {
      console.error("Error accepting line item:", err);
      toast.error("Failed to accept line item.");
    },
  });

  const handleSet = (value: any, key: string) => {
    setLi((prev: any) => ({
      ...prev,
      [key]: key === "supplier_readliness_date" ? new Date(value) : value,
    }));
  };

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

  return (
    <>
      <div className="flex flex-col gap-4 p-4 text-white">
        {lineItems.length > 0 ? (
          lineItems.map((d: any, index: number) => (
            <LineItemAccept
              key={index}
              d={d}
              onClick={() => {
                setLineItemId(d._id);
                setSelectedLineItem(d); // Store the selected line item
                setLi({
                  ssn: "",
                  supplier_readliness_date: "",
                });
                setErrors([]);
                onOpen();
              }}
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
            <Button onPress={onClose} color="danger">
              Close
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();

              const newErrors: string[] = [];

              if (!li.ssn) {
                newErrors.push("Serial Number is required.");
              }

              if (!li.supplier_readliness_date) {
                newErrors.push("Supplier Readliness Date is required.");
              } else if (
                selectedLineItem?.exw_date &&
                new Date(li.supplier_readliness_date) >=
                  new Date(selectedLineItem.exw_date)
              ) {
                newErrors.push(
                  "Supplier Readliness Date must be before EXW Date.",
                );
              }

              if (newErrors.length > 0) {
                setErrors(newErrors);
                return;
              }

              setErrors([]);
              updateLineItem.mutate(li);
            }}
            className="flex flex-col gap-4 p-5"
          >
            {errors.length > 0 && (
              <div className="flex flex-col items-center">
                <div className="bg-red-400 text-red-100 p-3 rounded-xl text-sm">
                  <ul className="list-disc pl-5">
                    {errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <Input
              type="text"
              onValueChange={(e) => handleSet(e, "ssn")}
              label="Serial Number"
              placeholder="Enter SSN"
              isRequired
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

            {selectedLineItem?.exw_date && (
              <Input
                label="EXW Date"
                type="date"
                isDisabled
                value={new Date(selectedLineItem.exw_date)
                  .toISOString()
                  .substring(0, 10)}
              />
            )}

            <Button isLoading={isLoading} color="primary" type="submit">
              Submit
            </Button>
          </form>
        </div>
      </CustomModal>
    </>
  );
}
