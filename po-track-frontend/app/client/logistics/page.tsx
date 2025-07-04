"use client";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { getData } from "@/core/api/apiHandler";
import { progressUpdate } from "@/core/api/apiRoutes";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import CustomModal from "@/components/Modal/CustomModal";
import {
  useDisclosure,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
} from "@heroui/react";
import { toast } from "sonner";
import { postData, putData } from "@/core/api/apiHandler";
import { queryClient } from "@/app/providers";

export default function LogisticsPage() {
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<any>(1);
  const [data, setData] = useState<any>([]);
  const [state, setState] = useState<any>();
  const [isLoading, setisLoading] = useState<boolean>(false);

  const handleSet = (type: any, value: any) => {
    setState((prev: any) => ({
      ...prev,
      [type]: type === "delivery_date" ? new Date(value) : value,
    }));
  };
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [selectedId, setSelectedLi] = useState<any>();

  const {
    data: getLogistics,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ["logistics", page],
    queryFn: () => getData(`${progressUpdate.getLogisitcs}${page}/5`, {}),
  });

  const delivery_status = [
    {
      key: "planned_vessel",
      label: "Planned Vessel",
    },
    {
      key: "planned_flight",
      label: "Planned Flight",
    },
    {
      key: "estimated_depature_from_origin",
      label: "Estimated Depature From Origin",
    },
    {
      key: "delivered",
      label: "Delivered",
    },
  ];

  const updateLogitics = useMutation({
    mutationKey: ["updateDelivery"],
    mutationFn: () => {
      return putData(
        `${progressUpdate.updateLogistics}${selectedId}`,
        {},
        { data: state },
      );
    },
    onMutate: () => {
      setisLoading(true);
    },
    onSuccess: (data: any) => {
      toast.success("Updated Logistics");
      queryClient.invalidateQueries({ queryKey: ["logistics", page] });
      setSelectedLi(null);
      onClose();
    },
    onError: (error: any) => {
      toast.error("Error while updating Logistics");
      console.log(error, "Error");
    },
  });

  useEffect(() => {
    if (isFetched) {
      const { total, logistics } = getLogistics?.data?.data ?? {};
      setTotalPage(Math.ceil(total / 5));
      setData(logistics ?? []);
      console.log(total, logistics, "Get Object");
    }
  }, [isFetching]);

  if (isFetching) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <BomLoadingCardSkeleton key={index} />
        ))}
      </div>
    );
  }
  const handleClick = (id: any) => {
    setSelectedLi(id);

    console.log(data, "data");
    if (data) {
      console.log(id, "ID");
      const item = data.find((d: any) => d._id == id);
      console.log(item.delivery_status, "item");
      handleSet("tracking_number", item.tracking_number);
      handleSet("tracking_link", item.tracking_link);
      handleSet("delivery_date", item.delivery_date);
      handleSet("delivery_status", item.delivery_status);
    }
    onOpen();
  };

  return (
    <>
      <div className="flex flex-col items-center  gap-4">
        {data.map((d: any, index: number) => (
          <div
            key={index}
            className={`flex flex-row w-2/3 items-center gap-4 ${d?.delivery_status === "delivered" ? "bg-green-500/20" : "bg-blue-500/20"} rounded-xl p-5 justify-center`}
          >
            <div className="flex flex-col gap-4 p-5" key={index}>
              <div className="flex flex-row items-center font-xl gap-4 p-5">
                <h1 className="font-bold text-xl">
                  {d?.purchaseOrder?.name || "No Purchase Order name"}
                </h1>
                <p>Line Item {d?.line_item?.LI?.name}</p>
                <h1 className="font-bold text-xl">
                  Supplier {d?.supplier?.name}
                </h1>
                <h1>
                  Actual Pickup Date{" "}
                  {
                    new Date(d?.line_item?.dispatched_date)
                      .toLocaleDateString()
                      .split(",")[0]
                  }
                </h1>
                <h1>Line Item Dispatched Qty {d?.line_item?.dispatchedQty}</h1>
              </div>
              <div className="flex flex-row gap-4 font-bold text-lg px-8">
                <h1>WMS Details</h1>
                <h1>WMS Ref No {d?.wms?.wmrefNo}</h1>
                <h1 className="uppercase">
                  Mode Of Transport {d?.wms?.modeOfTransport}
                </h1>
                <h1>Forwarder Name {d?.wms?.forwarder}</h1>
              </div>
              <div className="flex flex-row gap-4 font-bold text-lg px-8">
                <h1>CIPL Details</h1>
                <h1>CIPL InvoiceNo {d.cipl.invoiceNo}</h1>
                <Link href={d.cipl.ciplDocumentLink}>
                  CIPL Document {d.cipl.ciplDocumentLink.substring(0, 20)}
                </Link>
                <h1>
                  CIPL Submission Date{" "}
                  {
                    new Date(d.cipl.ciplSubDateToClient)
                      .toLocaleDateString()
                      .split(",")[0]
                  }
                </h1>
              </div>
              {d?.delivery_status && (
                <div className="flex font-bold flex-row items-center gap-4 p-4">
                  <Chip color="primary" className="uppercase">
                    {d?.delivery_status}
                  </Chip>
                  {d?.delivery_date && (
                    <p className="flex flex-row items-center gap-2">
                      <span>Delivery Date</span>
                      <span>
                        {
                          new Date(d?.delivery_date)
                            .toLocaleDateString()
                            .split(",")[0]
                        }
                      </span>
                    </p>
                  )}
                  <Link href={d?.tracking_link}>
                    Tracking Link {d?.tracking_link.substring(0, 10)}
                  </Link>
                  <p>Tracking Number {d?.tracking_number}</p>
                </div>
              )}
            </div>
            {d?.delivery_status !== "delivered" && (
              <Eye
                size={40}
                className="cursor-pointer"
                onClick={() => {
                  handleClick(d._id);
                }}
              />
            )}
          </div>
        ))}
      </div>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        heading="Update logistics"
        bottomContent={
          <div>
            <Button color="danger">Close</Button>
          </div>
        }
      >
        <form
          onSubmit={(e) => updateLogitics.mutate()}
          className="flex flex-col gap-4 p-5"
        >
          {state?.delivery_status ? (
            <Select
              onChange={(e) => handleSet("delivery_status", e.target.value)}
              className="max-w-xs"
              selectedKeys={[state.delivery_status.toString()]}
              label="Select Delivery Status"
            >
              {delivery_status.map((animal: any) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
          ) : (
            <Select
              onChange={(e) => handleSet("delivery_status", e.target.value)}
              className="max-w-xs"
              label="Select Delivery Status"
            >
              {delivery_status.map((animal: any) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
          )}
          {state?.delivery_status &&
            state.delivery_status !== "estimated_depature_from_origin" && (
              <Input
                type="date"
                label="Delivery Date"
                value={
                  state?.delivery_date
                    ? new Date(state?.delivery_date)
                        .toISOString()
                        .substring(0, 10)
                    : ""
                }
                onChange={(e) => handleSet("delivery_date", e.target.value)}
                isRequired={
                  state.delivery_status !== "estimated_depature_from_origin"
                }
                className="max-w-md"
              />
            )}
          <Input
            label="Tracking Number"
            isRequired
            value={state?.tracking_number ?? ""}
            onValueChange={(e) => handleSet("tracking_number", e)}
          />
          <Input
            label="Tracking Link"
            isRequired
            value={state?.tracking_link ?? ""}
            onValueChange={(e) => handleSet("tracking_link", e)}
          />
          <Button color="primary" type="submit" isLoading={isLoading}>
            Submit
          </Button>
        </form>
      </CustomModal>
    </>
  );
}
