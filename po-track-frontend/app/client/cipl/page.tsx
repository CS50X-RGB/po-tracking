"use client";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { progressUpdate } from "@/core/api/apiRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BrushCleaning, BookCheck, TimerReset, ClockAlert } from "lucide-react";
import {
  Chip,
  Button,
  useDisclosure,
  Input,
  SelectItem,
  Select,
} from "@heroui/react";
import Link from "next/link";
import CustomModal from "@/components/Modal/CustomModal";
import { useState } from "react";
import { toast } from "sonner";
import { queryClient } from "@/app/providers";

export default function CIPLPage() {
  const {
    isOpen: isFirstOpen,
    onOpen: openFirst,
    onClose: closeFirst,
    onOpenChange: toggleFirst,
  } = useDisclosure();

  const {
    isOpen: isSecondOpen,
    onOpen: openSecond,
    onClose: closeSecond,
    onOpenChange: toggleSecond,
  } = useDisclosure();

  const {
    data: manageCIPLGet,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ["getCIPL"],
    queryFn: () => getData(progressUpdate.manageCIPLGet, {}),
  });

  const [state, setState] = useState<any>({});
  const [selectedLi, setSelectedLi] = useState<any>(null);

  const handleSet = (type: any, value: any) => {
    setState((prev: any) => ({
      ...prev,
      [type]: type === "tentative_planned_date" ? new Date(value) : value,
    }));
  };

  const updateCIPL = useMutation({
    mutationKey: ["updateCIPL"],
    mutationFn: ({ data, id }: { data: any; id: any }) => {
      return putData(
        `${progressUpdate.updateCIPL}${id}`,
        {},
        {
          status: data,
        },
      );
    },
    onSuccess: (data: any) => {
      toast.success("Updated Status");
      queryClient.invalidateQueries({ queryKey: ["getCIPL"] });
      setSelectedLi(null);
      closeFirst();
    },
    onError: (error: any) => {
      toast.error("Error while updating Delivery");
      console.log(error, "Error");
    },
  });

  if (isFetching) {
    return (
      <div className="flex flex-col items-center gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <BomLoadingCardSkeleton key={index} />
        ))}
      </div>
    );
  } else {
    const deliveries = manageCIPLGet?.data?.data ?? [];

    const deliveryStatusOptions = [
      {
        key: "ClearedForShipping",
        label: "Cleared for Shipping",
      },
      {
        key: "CIPLUnderReview",
        label: "CIPLUnderReview",
      },
      {
        key: "CIPLReviewedAndRejected",
        label: "CIPLReviewedAndRejected",
      },
      {
        key: "CIPLReviewedAndSubmittedToADM",
        label: "CIPLReviewedAndSubmittedToADM",
      },
      {
        key: "CIPLUnderADMReview",
        label: "CIPLUnderADMReview",
      },
      {
        key: "AwaitingPickUp",
        label: "AwaitingPickup",
      },
    ];

    if (deliveries.length > 0) {
      return (
        <div className="flex flex-col items-center gap-4 p-5">
          {deliveries.map((d: any, index: number) => {
            const purchaseOrder = d.purchaseOrder ?? {};
            const lis = d?.progressUpdates ?? [];

            return (
              <div
                key={index}
                className="flex flex-col items-start w-full bg-blue-700/20 rounded-xl p-5"
              >
                <div className="flex flex-col gap-4 font-bold items-start">
                  <h1>{purchaseOrder.name}</h1>
                  <div className="flex flex-row items-center gap-4">
                    <h1>Freight Term {purchaseOrder?.freight_term?.name}</h1>
                    <h1>Payment Term {purchaseOrder?.payment_term?.name}</h1>
                    <h1>
                      Order Date{" "}
                      {
                        new Date(purchaseOrder?.order_date)
                          .toLocaleString()
                          .split(",")[0]
                      }
                    </h1>
                    <h1>Client Branch {purchaseOrder?.client_branch?.name}</h1>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="grid grid-cols-6 w-full gap-6 p-4 border-b border-white">
                    <h1 className="font-semibold text-white">Name</h1>
                    <h1 className="font-semibold text-white">CIPL Link</h1>
                    <h1 className="font-semibold text-white">Supplier</h1>
                    <h1 className="font-semibold text-white">
                      CIPL Submission Date
                    </h1>
                    <h1 className="font-semibold text-white">Invoice Number</h1>
                    <h1 className="font-semibold text-white">
                      Delivery Status
                    </h1>
                  </div>

                  {lis?.map((li: any, index: number) => {
                    const selectedKey = deliveryStatusOptions.find(
                      (d: any) => d.label === li.delivery_status,
                    );

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-6 w-full gap-8 p-4 border-b border-white"
                      >
                        <h2 className="text-white">{li.LI?.name || "-"}</h2>

                        <Link
                          href={li.cipl?.ciplDocumentLink || "#"}
                          className="text-blue-300"
                        >
                          {li.cipl?.ciplDocumentLink?.substring(0, 30) || "N/A"}
                        </Link>

                        <Chip className="text-white uppercase font-bold shadow-xl bg-blue-600/20">
                          {li.supplier.name}
                        </Chip>

                        <h1>
                          {
                            new Date(li.cipl?.ciplSubDateToClient)
                              .toLocaleString()
                              .split(",")[0]
                          }
                        </h1>

                        <p>{li.cipl?.invoiceNo}</p>
                        <Select
                          selectedKeys={[selectedKey?.key ?? ""]}
                          onChange={(e) => {
                            updateCIPL.mutate({
                              id: li._id,
                              data: e.target.value,
                            });
                          }}
                          className="max-w-xs"
                          label="Delivery Status"
                        >
                          {deliveryStatusOptions.map((option: any) => (
                            <SelectItem key={option.key}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center w-full">
          <h1 className="flex text-2xl items-center gap-4 justify-center flex-row font-bold text-center w-full">
            <span>No Line Items for Delivery Management Here</span>
            <BrushCleaning size={40} />
          </h1>
        </div>
      );
    }
  }
}
