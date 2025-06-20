'use client';

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
    const { clientId } = useParams();
    console.log(clientId);
    const { isOpen: isOpenClient, onOpen: onOpenClient, onOpenChange: onOpenChangeClient, onClose: onCloseClient } = useDisclosure();
    const [client, setClient] = useState<any>({
        name: "",
        ewx_date: "",
    });
    const [pages, setPages] = useState<number>(1);
    const [clientData, setClientData] = useState<any>({});

    const [isLoading, setisLoading] = useState<boolean>(false);
    const createClient = useMutation({
        mutationKey: ["createsubClient"],
        mutationFn: (data: any) => {
            return postData(`${masterRoutes.createSubClients}/${clientId}`, {}, { clientBranch : data });
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
                position: "top-right"
            });
            queryClient.invalidateQueries();
        },
        onError: (error: any) => {
            console.log(error, "error");
            toast.error("Error While adding creating client", {
                position: "top-right"
            });
        }
    });
    const [pagesClient, setpagesClient] = useState<number>(1);
    const { data: getallClient, isFetched: isFetchedClients, isFetching: isFetchingClients } = useQuery({
        queryKey: ["getAllSubClient", pagesClient],
        queryFn: () => {
            return getData(`${masterRoutes.getSubClient}/${clientId}/${pagesClient}/5`, {}, {});
        }
    });

    useEffect(() => {
        if (isFetchedClients) {
            const { client,clientBranchs, total } = getallClient?.data.data;
            console.log(getallClient?.data.data);
            setPages(total / 5);
            setClientData(clientBranchs);

        }
    }, [isFetchingClients])

    const handleChange = (e: any, type: "name" | "exw_date") => {
        setClient((prev: any) => ({
            ...prev,
            [type]: e
        }));
    };
    const handleSubmit = () => {
        createClient.mutate(client);
    }
    const columnHeaders = [
        {
            "name": "Sub Client Name"
        },
        {
            "name": "Exw Date"
        }
    ]

    return (
        <>
            <div className="flex flex-col p-5 gap-6">
                <Card>
                    <CardHeader className="flex flex-col gap-5">
                        <h1>Client Name : {getallClient?.data?.data?.client?.name}</h1>
                        <h1>Client Address : {getallClient?.data?.data?.client?.address}</h1>
                    </CardHeader>
                </Card>
                <div className="flex flex-row items-center justify-between w-full">
                    <h1 className="text-2xl font-bold">All Sub Clients</h1>
                    <Button color="primary" onPress={() => onOpenClient()}>Add Client</Button>
                </div>
                <ShowTableData columnHeaders={columnHeaders} data={getallClient?.data.data?.clientBranches} page={pagesClient} pages={pages} setPage={setClientData} loadingState={isFetchedClients} />
            </div>
            <CustomModal bottomContent={
                <div className="flex flex-row">
                    <Button onPress={() => onCloseClient()}>Close</Button>
                </div>
            } isOpen={isOpenClient} onOpenChange={onOpenChangeClient} heading="Create Client">
                <form onSubmit={() => handleSubmit()} className="flex flex-col gap-5 p-5">
                    <Input label="Client Branch Name" onValueChange={(e) => handleChange(e, "name")} />
                    <Input label="Client Exw Date" type="number" onValueChange={(e) => handleChange(e, "exw_date")} />
                    <Button type="submit" isLoading={isLoading} className="w-full" color="primary">Add Sub Client</Button>
                </form>
            </CustomModal>
        </>
    )
}
