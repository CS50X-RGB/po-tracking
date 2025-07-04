import PageViewComponent from "@/components/PageViewComponent";
import { poRoutes } from "@/core/api/apiRoutes";

export default function viweOpenLi() {
  const route = poRoutes.viewOpenPOSupplier;

  const columnHeaders = [
    {
      name: "Purchase Order Name",
    },
    {
      name: "Client Name",
    },
    {
      name: "Client Branch Name",
    },
    {
      name: "Payment Terms",
    },
    // {
    //   name: "Freight Terms",
    // },
    {
      name: "Order Date",
    },
    {
      name: "Purchase Action",
    },
  ];

  return (
    <PageViewComponent
      columnHeaders={columnHeaders}
      heading="View Open Purchase Order"
      queryKey="get-openPO-data-supplier"
      route={route}
    />
  );
}
