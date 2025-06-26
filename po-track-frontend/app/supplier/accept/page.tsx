"use client";
import { useQuery } from "@tanstack/react-query";
import { poRoutes } from "@/core/api/apiRoutes";
import { getData } from "@/core/api/apiHandler";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { Card, CardBody, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";
import PurchaseNotAccepted from "@/components/Card/PurchaseNotAccepted";

export default function AcceptPage() {
  const { data: getPos, isFetching: isFetchingPo } = useQuery({
    queryKey: ["getPos"],
    queryFn: () => getData(poRoutes.notAccepted, {}),
  });
  const pos = getPos?.data?.data || [];

  console.log(pos, "Pos");

  if (isFetchingPo) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <BomLoadingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      {pos.length > 0 ? (
        pos.map((po: any) => <PurchaseNotAccepted key={po._id} po={po} />)
      ) : (
        <p className="font-bold text-start text-2xl">No pending POs found.</p>
      )}
    </div>
  );
}
