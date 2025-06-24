import { Card, CardHeader, CardBody } from "@heroui/react";

export default function PurchaseOrderCard({ po }: any) {
  return (
    <Card className="w-full p-5 flex flex-col gap-5">
      <CardHeader className="font-bold text-2xl">
        Purchase Order {po?.data?.data?.name}
      </CardHeader>
      <CardBody className="flex flex-col gap-4 p-4">
        <h1 className="font-bold text-xl">
          Order Date {new Date(po?.data?.data?.order_date).toLocaleString()}
        </h1>
        <p className="font-bold text-md">
          Payment Term: {po?.data?.data?.payment_term?.name}
        </p>
        <p className="font-bold text-xl">
          Frieght Term {po?.data?.data?.freight_term?.name}
        </p>
        <p className="flex flex-row items-center font-bold text-md gap-4">
          <span>Client {po?.data.data.client.name}</span>
          <span>Client Branch Name {po?.data.data.client_branch.name}</span>
        </p>
      </CardBody>
    </Card>
  );
}
