import { Button, Card, CardBody, Chip } from "@heroui/react";

export default function LineItemAccept({
  d,
  onClick,
}: {
  d: any;
  onClick: () => void;
}) {
  return (
    <Card className="p-4  rounded-xl">
      <CardBody className="flex flex-row items-center justify-between">
        <div className="flex flex-col font-semibold text-lg gap-2">
          <h1>Line Item: {d.name}</h1>
          <Chip className="bg-green-800">{d.line_item_type}</Chip>
          <p>Qty: {d.qty}</p>
          <p>Currency {d.currency}</p>
          <p>Unit Cost: ₹{d.unit_cost}</p>
          <p>
            Date Required{" "}
            {new Date(d.date_required).toLocaleString().split(",")[0]}
          </p>
          <p>Exw Date {new Date(d.exw_date).toLocaleString().split(",")[0]}</p>
        </div>
        <Button onPress={onClick} color="primary">
          Accept
        </Button>
      </CardBody>
    </Card>
  );
}
