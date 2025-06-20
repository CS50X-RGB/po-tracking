"use client";

import { queryClient } from "@/app/providers";
import CustomTable from "@/components/CustomTable";
import CustomModal from "@/components/Modal/CustomModal";
import ShowTableData from "@/components/ShowTableData";
import { getData, postData } from "@/core/api/apiHandler";
import { masterRoutes } from "@/core/api/apiRoutes";
import { Button } from "@heroui/button";
import { Card, CardHeader, Input, useDisclosure } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function Master() {
  const { supplierId } = useParams();

  const {
    isOpen: isOpenClient,
    onOpen: onOpenClient,
    onOpenChange: onOpenChangeClient,
    onClose: onCloseClient,
  } = useDisclosure();
  const [client, setClient] = useState<any>({
    name: "",
  });
  const [pages, setPages] = useState<number>(1);
  const [clientData, setClientData] = useState<any>({});

  const [isLoading, setisLoading] = useState<boolean>(false);
  const createClient = useMutation({
    mutationKey: ["createsubSupplier"],
    mutationFn: (data: any) => {
      return postData(
        `${masterRoutes.createSubSupplier}/${supplierId}`,
        {},
        { supplierBranch: data },
      );
    },
    onMutate: () => {
      setisLoading(true);
    },
    onSettled: () => {
      setisLoading(false);
    },
    onSuccess: (data: any) => {
      toast.success("Success while creating Supplier", {
        position: "top-right",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.log(error, "error");
      toast.error("Error While adding creating Supplier", {
        position: "top-right",
      });
    },
  });
  const [pagesClient, setpagesClient] = useState<number>(1);
  const {
    data: getallClient,
    isFetched: isFetchedClients,
    isFetching: isFetchingClients,
  } = useQuery({
    queryKey: ["getAllSubSupplier", pagesClient],
    queryFn: () => {
      return getData(
        `${masterRoutes.getSubSupplier}/${supplierId}/${pagesClient}/5`,
        {},
      );
    },
  });

  useEffect(() => {
    if (isFetchedClients) {
      const { supplier, supplierBranches, total } = getallClient?.data.data;
      setPages(total / 5);
      setClientData(supplierBranches);
    }
  }, [isFetchingClients]);

  const handleChange = (e: any, type: "name") => {
    setClient((prev: any) => ({
      ...prev,
      [type]: e,
    }));
  };
  const handleSubmit = () => {
    createClient.mutate(client);
  };
  const columnHeaders = [
    {
      name: "Sub Supplier Name",
    },
  ];

  return (
    <>
      <div className="flex flex-col p-5 gap-6">
        <Card className="w-1/3 p-4 font-bold">
          <CardHeader className="flex flex-col gap-5 items-start">
            <h1>Supplier Name : {getallClient?.data?.data?.supplier?.name}</h1>
            <h1>
              Supplier Address : {getallClient?.data?.data?.supplier?.address}
            </h1>
          </CardHeader>
        </Card>
        <div className="flex flex-row items-center justify-between w-full">
          <h1 className="text-2xl font-bold">All Sub Clients</h1>
          <Button color="primary" onPress={() => onOpenClient()}>
            Add Sub Supplier
          </Button>
        </div>
        <ShowTableData
          columnHeaders={columnHeaders}
          data={getallClient?.data.data?.supplierBranches}
          page={pagesClient}
          pages={pages}
          setPage={setClientData}
          loadingState={isFetchedClients}
        />
      </div>
      <CustomModal
        bottomContent={
          <div className="flex flex-row">
            <Button onPress={() => onCloseClient()}>Close</Button>
          </div>
        }
        isOpen={isOpenClient}
        onOpenChange={onOpenChangeClient}
        heading="Create Branch Supplier"
      >
        <form
          onSubmit={() => handleSubmit()}
          className="flex flex-col gap-5 p-5"
        >
          <Input
            label="Supplier Name"
            onValueChange={(e) => handleChange(e, "name")}
          />
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            color="primary"
          >
            Add Sub Supplier
          </Button>
        </form>
      </CustomModal>
    </>
  );
}
