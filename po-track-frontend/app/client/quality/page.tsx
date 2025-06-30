"use client";
import BomLoadingCardSkeleton from "@/components/Card/BomLoadingCard";
import { getData } from "@/core/api/apiHandler";
import { progressUpdate } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";

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

  console.log(getNonAccepted?.data.data, "NonAccpted");

  if (isFetching) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <BomLoadingCardSkeleton key={index} />
        ))}
      </div>
    );
  } else {
    return <h1>Quality Fix</h1>;
  }
}
