"use client";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { getData, postData } from "@/core/api/apiHandler";
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

export default function DeliveryPage() {
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
    data: manageDelivery,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ["getManagedDelivery"],
    queryFn: () => getData(progressUpdate.mangeDelivery, {}),
  });

  const [state, setState] = useState<any>({});
  const [selectedLi, setSelectedLi] = useState<any>(null);

  const handleSet = (type: any, value: any) => {
    setState((prev: any) => ({
      ...prev,
      [type]: type === "tentative_planned_date" ? new Date(value) : value,
    }));
  };

  const updateDelivery = useMutation({
    mutationKey: ["updateDelivery"],
    mutationFn: ({ data, id }: { data: any; id: any }) => {
      return postData(`${progressUpdate.managePostDelivery}${id}`, {}, data);
    },
    onSuccess: (data: any) => {
      toast.success("Updated Delivery");
      queryClient.invalidateQueries({ queryKey: ["getManagedDelivery"] });
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
    const deliveries = manageDelivery?.data?.data ?? [];

    const wms_mode_of_transport = [
      { key: "air", label: "Air" },
      { key: "sea", label: "Sea" },
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
                    <h1 className="font-semibold text-white">Action</h1>
                  </div>

                  {lis?.map((li: any, index: number) => (
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
                      <div className="flex flex-row gap-4 items-center">
                        <Button
                          isIconOnly
                          className="bg-green-400"
                          onClick={() => {
                            setSelectedLi(li);
                            openFirst();
                          }}
                        >
                          <BookCheck />
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedLi(li);
                            openSecond();
                            handleSet("action", "2");
                          }}
                          isIconOnly
                          color="warning"
                        >
                          <TimerReset />
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedLi(li);
                            openSecond();
                            handleSet("action", "3");
                          }}
                          isIconOnly
                          color="danger"
                        >
                          <ClockAlert />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <CustomModal
                  heading="Add WMS"
                  bottomContent={
                    <div className="flex flex-end w-full">
                      <Button color="danger" onClick={closeFirst}>
                        Close
                      </Button>
                    </div>
                  }
                  onOpenChange={toggleFirst}
                  isOpen={isFirstOpen}
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateDelivery.mutate({
                        data: {
                          ...state,
                          action: "1",
                        },
                        id: selectedLi?._id,
                      });
                    }}
                    className="flex flex-col gap-4 w-full p-3"
                  >
                    <Input
                      label="WMSRefNo"
                      value={state.wmrefNo}
                      onValueChange={(e) => handleSet("wmrefNo", e)}
                    />
                    <Select
                      onChange={(e: any) =>
                        handleSet("modeOfTransport", e.target.value)
                      }
                      className="max-w-xs"
                      selectedKeys={[state.modeOfTransport]}
                      label="Select WMS Mode of Transport"
                    >
                      {wms_mode_of_transport.map((mode) => (
                        <SelectItem key={mode.key}>{mode.label}</SelectItem>
                      ))}
                    </Select>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </form>
                </CustomModal>
                <CustomModal
                  heading="Add Tentetive Plan Date"
                  bottomContent={
                    <div className="flex flex-end w-full">
                      <Button color="danger" onClick={closeSecond}>
                        Close
                      </Button>
                    </div>
                  }
                  onOpenChange={toggleSecond}
                  isOpen={isSecondOpen}
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateDelivery.mutate({
                        data: { state },
                        id: selectedLi?._id,
                      });
                    }}
                    className="flex flex-col gap-4 w-full p-3"
                  >
                    <Input
                      type="date"
                      label="Tentative Planned Date"
                      value={
                        state.tentative_planned_date
                          ? new Date(state.tentative_planned_date)
                              .toISOString()
                              .substring(0, 10)
                          : ""
                      }
                      onChange={(e) =>
                        handleSet("tentative_planned_date", e.target.value)
                      }
                      isRequired
                      className="max-w-md"
                    />
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </form>
                </CustomModal>
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
