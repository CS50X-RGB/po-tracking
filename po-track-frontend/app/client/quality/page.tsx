"use client";
import { queryClient } from "@/app/providers";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { getData, putData } from "@/core/api/apiHandler";
import { progressUpdate } from "@/core/api/apiRoutes";
import { Chip, Button } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookCheck, BookmarkX, BrushCleaning, BrushIcon } from "lucide-react";
import { toast } from "sonner";

export default function QualityPage() {
  const {
    data: getNonAccepted,
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ["getNonAccepted"],
    queryFn: () => {
      return getData(progressUpdate.nonQdApproved, {});
    },
  });
  const updateQd = useMutation({
    mutationKey: ["updateQd"],
    mutationFn: ({ data, id }: { data: any; id: any }) => {
      return putData(`${progressUpdate.updateApproval}${id}`, {}, data);
    },
    onSuccess: (data: any) => {
      toast.success("Update Qd");
      queryClient.invalidateQueries({ queryKey: ["getNonAccepted"] });
    },
    onError: (error: any) => {
      toast.error("Error while updating Qd");
      console.log(error, "Error");
    },
  });

  if (isFetching) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <BomLoadingCardSkeleton key={index} />
        ))}
      </div>
    );
  } else {
    const notAccepted = getNonAccepted?.data?.data ?? [];

    if (notAccepted.length > 0) {
      return notAccepted.map((d: any, index: number) => {
        const po = d?.purchaseOrder ?? {};
        const lis = d?.progressUpdates ?? [];

        return (
          <div
            key={index}
            className={`p-5 rounded-full bg-black/20 h-[${lis.length} * 100px] w-full`}
          >
            <div className="flex p-5 flex-row rounded-md text-md  items-center gap-4 flex-wrap w-full font-bold">
              <h1 className="flex flex-row items-center">{po.name}</h1>
              <h1>
                Order Date{" "}
                {new Date(po.order_date).toLocaleString().split(",")[0]}
              </h1>
              <h3>Payment Terms {po?.payment_term?.name}</h3>
              <h3>Frieght Terms {po?.freight_term?.name}</h3>
              <h4>Branch Code {po?.client_branch?.name}</h4>
            </div>
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="grid grid-cols-5 w-full gap-8 p-4 border-b border-white">
                <h1 className="font-semibold text-white">Name</h1>
                <h1 className="font-semibold text-white">QD Link</h1>
                <h1 className="font-semibold text-white">Inspection Tracker</h1>
                <h1 className="font-semibold text-white">Supplier</h1>
                <h1 className="font-semibold text-white">Action</h1>
              </div>
              {lis?.map((li: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-5 w-full gap-8 p-4 border-b border-white"
                >
                  <h2 className="text-white">{li.LI?.name || "-"}</h2>
                  <h2 className="text-blue-300">
                    {li.finalInspection?.QDLink || "N/A"}
                  </h2>
                  <Chip className="uppercase font-bold" color="secondary">
                    {li.finalInspection?.inspectionTracker || "Pending"}
                  </Chip>
                  <Chip className="text-white uppercase font-bold shadow-xl bg-blue-600/20">
                    {li.supplier.name}
                  </Chip>
                  <div className="flex flex-row gap-4 items-center">
                    <Button isIconOnly className="bg-green-400">
                      <BookCheck
                        onClick={() =>
                          updateQd.mutate({
                            data: { approved: "Yes" },
                            id: li._id,
                          })
                        }
                      />
                    </Button>
                    <Button isIconOnly color="danger">
                      <BookmarkX
                        onClick={() =>
                          updateQd.mutate({
                            data: { approved: "No" },
                            id: li._id,
                          })
                        }
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      });
    } else {
      return (
        <div className="flex flex-row items-center w-full">
          <h1 className="flex text-2xl items-center gap-4 justify-center flex-row font-bold text-center w-full">
            <span>No Line Items for Approval Here</span>
            <BrushCleaning size={40} />
          </h1>
        </div>
      );
    }
  }
}
