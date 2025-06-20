"use client";
import SearchInput from "@/components/AutoComplete";
import { postData } from "@/core/api/apiHandler";
import { masterRoutes, poRoutes } from "@/core/api/apiRoutes";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function PoCreate() {
  const [po, setPo] = useState<any>({
    name: "",
    client: "",
    client_branch: "",
    supplier: "",
    payment_term: "",
    freight_term: "",
  });
  const handleSet = (e: string, key: string) => {
    setPo((prev: any) => ({
      ...prev,
      [key]: key === "order_date" ? new Date(e) : e,
    }));
  };

  const newPo = useMutation({
    mutationKey: ["new_po"],
    mutationFn: (data: any) => {
      return postData(
        poRoutes.createPo,
        {},
        {
          po: data,
        },
      );
    },
    onSuccess: (data: any) => {
      console.log(data.data);
      toast.success("Purchase Order Added", {
        position: "top-left",
      });
    },
    onError: (error: any) => {
      console.log(error);
      toast.error("Error while adding purchase order");
    },
  });

  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <Card className="w-xl">
        <CardHeader className="text-2xl font-bold">
          Create Purchase Order
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4">
          <form
            onSubmit={() => newPo.mutate(po)}
            className="flex flex-col items-center gap-4 w-[80vh] flex-wrap"
          >
            <Input
              value={po.name}
              label="Purchase Order Name"
              className="w-[40vh]"
              onValueChange={(e) => handleSet(e, "name")}
            />
            <div className="flex w-full flex-col items-center justify-around">
              <SearchInput
                label="Client"
                api={masterRoutes.getClients}
                type="client"
                state={po.client}
                setState={handleSet}
              />
              {po.client && (
                <SearchInput
                  label="Client Branches"
                  api={`${masterRoutes.getAllClientBranches}/${po.client}`}
                  type="client_branch"
                  state={po.client_branch}
                  setState={handleSet}
                />
              )}
            </div>
            <SearchInput
              label="Frieght Terms"
              api={`${masterRoutes.getPaymentTerms}frieght`}
              type="freight_term"
              state={po.frieght_term}
              setState={handleSet}
            />
            <SearchInput
              label="Payment Terms"
              api={`${masterRoutes.getPaymentTerms}payment`}
              type="payment_term"
              state={po.payment_term}
              setState={handleSet}
            />
            <SearchInput
              label="Supplier"
              api={masterRoutes.getSupplier}
              type="supplier"
              state={po.supplier}
              setState={handleSet}
            />
            <Input
              type="date"
              label="Order Date"
              value={
                po.order_date
                  ? new Date(po.order_date).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => handleSet(e.target.value, "order_date")}
              isRequired
              className="max-w-md"
            />
            <Button color="primary" type="submit">
              Submit
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
