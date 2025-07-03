import PageViewComponent from "@/components/PageViewComponent";
import { poRoutes } from "@/core/api/apiRoutes";

export default function viweOpenLi() {
  const route = poRoutes.viewOpenLI;
  const coloumnHeaders = [
    {
      name: "name",
    },
    {
      name: "Part Number",
    },
    {
      name: "EXW Date",
    },
    {
      name: "Total Cost",
    },

    {
      name: "Unit Cost",
    },
    {
      name: "Purchase Order",
    },
    {
      name: "Supplier",
    },
    {
      name: "Line Item Status",
    },
    {
      name: "Line Item Type",
    },
  ];

  return (
    <PageViewComponent
      columnHeaders={coloumnHeaders}
      heading="View Open Line Items"
      queryKey="get-openLI-data"
      route={route}
    />
  );
}
