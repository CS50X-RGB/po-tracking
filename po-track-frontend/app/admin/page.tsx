'use client';
import React from "react";
import CustomTable from "@/components/CustomTable";
import { getData } from "@/core/api/apiHandler";
import { accountRoutes, analyticsRoutes } from "@/core/api/apiRoutes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";



export default function Page() {
  const [page, setPage] = useState<number>(1);
  const { data: getAllUsers, isFetching } = useQuery({
    queryKey: ["get-all-users", page],
    queryFn: async () => {
      return await getData(`${accountRoutes.allUsers}/?page=${page}&offset=5`, {});
    }
  });



  if (isFetching) {
    return (
      <div className="flex flex-row items-center justify-center h-[80vh]">
        <Spinner />
      </div>
    )
  } else {

    return (
        <div className="flex flex-col gap-4 w-full">
          <h1 className="font-bold text-xl">View Users</h1>
          <CustomTable
            data={getAllUsers?.data.data.users}
            loadingState={isFetching}
            page={page}
            setPage={setPage}
            pages={1}
          />
      </div>
    );
  }
}
