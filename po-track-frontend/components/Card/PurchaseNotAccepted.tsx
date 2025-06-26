import { Card, CardBody, Chip } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function PurchaseNotAccepted({ po }: any) {
  console.log(po._id);
  const router = useRouter();

  return (
    <Card
      isPressable={true}
      onPress={() => router.push(`/supplier/accept/${po._id}`)}
      key={po._id}
      className="p-4 rounded-xl shadow-xl"
    >
      <h2 className="text-xl text-start font-bold">{po.name}</h2>
      <CardBody className="flex flex-col gap-4">
        <Chip className="bg-red-700">
          {po.lineItem?.length ?? 0} Line Items Not Accepted
        </Chip>
        <div className="flex flex-row gap-4 items-center">
          <h1 className="rounded-xl bg-blue-950 px-4">
            Frieght Terms {po?.freight_term?.name}
          </h1>
          <h1 className="rounded-xl text-black bg-yellow-300 px-4">
            Payment Terms {po?.payment_term?.name}
          </h1>
        </div>
        <p>Order Date {new Date(po.order_date).toLocaleDateString()}</p>
        <p className="font-bold">Client: {po.client?.name || "N/A"}</p>
        <Chip className="bg-violet-600 items-center">
          Client Branch {po?.client_branch?.name}
        </Chip>
      </CardBody>
    </Card>
  );
}
