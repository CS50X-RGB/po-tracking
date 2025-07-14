"use client";

import PageViewComponent from "@/components/PageViewComponent";
import { progressUpdate } from "@/core/api/apiRoutes";

export default function ApprovePage() {
  const rows = [
    {
      name: "Line Item",
    },
    {
      name: "Purchase Order",
    },
    {
      name: "Part Details",
    },
    {
      name: "Supplier Readliness Date Changes",
    },
    {
      name: "EXW Date Changes",
    },
    {
      name: "Date Required Changes",
    },
    {
      name: "Line Item Status Changes",
    },
    {
      name: "FeedBack Action",
    },
  ];

  return (
    <PageViewComponent
      queryKey="feedBackLineItem"
      route={progressUpdate.supplierFeedBackLineItem}
      heading={"View Non Approved Line Items"}
      columnHeaders={rows}
    />
  );
}
