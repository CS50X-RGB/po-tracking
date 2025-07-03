"use client";

import { queryClient } from "@/app/providers";
import CustomTable from "@/components/CustomTable";
import CustomModal from "@/components/Modal/CustomModal";
import ShowTableData from "@/components/ShowTableData";
import { getData, postData } from "@/core/api/apiHandler";
import { masterRoutes } from "@/core/api/apiRoutes";
import { Button } from "@heroui/button";
import { Input, useDisclosure } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Master() {
  const {
    isOpen: isOpenClient,
    onOpen: onOpenClient,
    onOpenChange: onOpenChangeClient,
    onClose: onCloseClient,
  } = useDisclosure();
  const {
    isOpen: isOpenSupplier,
    onOpen: onOpenSupplier,
    onOpenChange: onOpenChangeSupplier,
    onClose: onCloseSupplier,
  } = useDisclosure();
  const [client, setClient] = useState<any>({
    name: "",
    address: "",
  });

  const [supplier, setSupplier] = useState<any>({
    name: "",
    address: "",
  });
  const [pages, setPages] = useState<number>(1);

  const [supplierPages, setSupplierPages] = useState<number>(1);
  const [clientData, setClientData] = useState<any>({});
  const [supplierData, setSupplierData] = useState<any>({});

  const [isLoading, setisLoading] = useState<boolean>(false);
  const [isLoadingSupplier, setisLoadingSupplier] = useState<boolean>(false);
  const createClient = useMutation({
    mutationKey: ["createClient"],
    mutationFn: (data: any) => {
      return postData(masterRoutes.createClient, {}, { client: data });
    },
    onMutate: () => {
      setisLoading(true);
    },
    onSettled: () => {
      setisLoading(false);
    },
    onSuccess: (data: any) => {
      console.log(data.data, "Client");
      toast.success("Success while creating client", {
        position: "top-right",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.log(error, "error");
      toast.error("Error While adding creating client", {
        position: "top-right",
      });
    },
  });
  const createSupplier = useMutation({
    mutationKey: ["createSupplier"],
    mutationFn: (data: any) => {
      return postData(masterRoutes.createSupplier, {}, { supplier: data });
    },
    onMutate: () => {
      setisLoadingSupplier(true);
    },
    onSettled: () => {
      setisLoadingSupplier(false);
    },
    onSuccess: (data: any) => {
      toast.success("Success while creating supplier", {
        position: "top-right",
      });
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      console.log(error, "error");
      toast.error("Error While adding creating supplier", {
        position: "top-right",
      });
    },
  });

  const [pagesClient, setpagesClient] = useState<number>(1);
  const [pagesSupplier, setPagesSupplier] = useState<number>(1);
  const {
    data: getallClient,
    isFetched: isFetchedClients,
    isFetching: isFetchingClients,
  } = useQuery({
    queryKey: ["getAllClient", pagesClient],
    queryFn: () => {
      return getData(`${masterRoutes.getClient}${pagesClient}/5`, {});
    },
  });
  const {
    data: getallSupplier,
    isFetched: isFetchedSuppliers,
    isFetching: isFetchingSuppliers,
  } = useQuery({
    queryKey: ["getAllsupplier", pagesClient],
    queryFn: () => {
      return getData(`${masterRoutes.getSupplier}${pagesClient}/5`, {});
    },
  });
  console.log();
  useEffect(() => {
    if (isFetchedClients) {
      const { client, total } = getallClient?.data?.data;
      console.log(getallClient?.data.data);
      setPages(total / 5);
      setClientData([]);
    }
  }, [isFetchingClients]);
  useEffect(() => {
    if (isFetchedSuppliers) {
      const { supplier, total } = getallSupplier?.data.data;
      setPages(total / 5);
      setSupplierData(supplier);
    }
  }, [isFetchingSuppliers]);

  const handleChange = (
    con: "client" | "supplier",
    e: any,
    type: "name" | "address",
  ) => {
    if (con === "client") {
      setClient((prev: any) => ({
        ...prev,
        [type]: e,
      }));
    } else if (con === "supplier") {
      setSupplier((prev: any) => ({
        ...prev,
        [type]: e,
      }));
    }
  };
  const handleSubmit = (con: "supplier" | "client") => {
    if (con === "client") {
      createClient.mutate(client);
    } else if (con === "supplier") {
      createSupplier.mutate(supplier);
    }
  };
  const sellerHeaders = [
    {
      name: "Supplier Name",
    },
    {
      name: "Supplier Address",
    },
    {
      name: "Supplier Action",
    },
  ];
  const columnHeaders = [
    {
      name: "Client Name",
    },
    {
      name: "Client Address",
    },
    {
      name: "Client Action",
    },
  ];

  return (
    <>
      <div className="flex flex-col p-5 gap-6">
        <div className="flex flex-row items-center justify-between w-full">
          <h1 className="text-2xl font-bold">All Clients</h1>
          <Button color="primary" onPress={() => onOpenClient()}>
            Add Client
          </Button>
        </div>
        <ShowTableData
          columnHeaders={columnHeaders}
          data={getallClient?.data.data?.client}
          page={pagesClient}
          pages={pages}
          setPage={setpagesClient}
          loadingState={isFetchedClients}
        />
      </div>
      <div className="flex flex-col p-5 gap-6">
        <div className="flex flex-row items-center justify-between w-full">
          <h1 className="text-2xl font-bold">All Suppliers</h1>
          <Button color="primary" onPress={() => onOpenSupplier()}>
            Add Supplier
          </Button>
        </div>
        <ShowTableData
          columnHeaders={sellerHeaders}
          data={getallSupplier?.data.data?.supplier}
          page={pagesSupplier}
          pages={pages}
          setPage={setpagesClient}
          loadingState={isFetchedClients}
        />
      </div>
      <CustomModal
        bottomContent={
          <div className="flex flex-row">
            <Button onPress={() => onCloseSupplier()}>Close</Button>
          </div>
        }
        isOpen={isOpenSupplier}
        onOpenChange={onOpenChangeSupplier}
        heading="Create Supplier"
      >
        <form
          onSubmit={() => handleSubmit("supplier")}
          className="flex flex-col gap-5 p-5"
        >
          <Input
            label="Supplier Name"
            onValueChange={(e) => handleChange("supplier", e, "name")}
          />
          <Input
            label="Supplier Address"
            onValueChange={(e) => handleChange("supplier", e, "address")}
          />
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            color="primary"
          >
            Add Supplier
          </Button>
        </form>
      </CustomModal>

      <CustomModal
        bottomContent={
          <div className="flex flex-row">
            <Button onPress={() => onCloseClient()}>Close</Button>
          </div>
        }
        isOpen={isOpenClient}
        onOpenChange={onOpenChangeClient}
        heading="Create Client"
      >
        <form
          onSubmit={() => handleSubmit("client")}
          className="flex flex-col gap-5 p-5"
        >
          <Input
            label="Client Name"
            onValueChange={(e) => handleChange("client", e, "name")}
          />
          <Input
            label="Client Address"
            onValueChange={(e) => handleChange("client", e, "address")}
          />
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
            color="primary"
          >
            Add Client
          </Button>
        </form>
      </CustomModal>
    </>
  );
}
