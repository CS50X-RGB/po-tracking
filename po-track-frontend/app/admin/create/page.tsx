"use client";
import {
  Button,
  Card,
  CardBody,
  Input,
  Autocomplete,
  AutocompleteItem,
  CardHeader,
} from "@heroui/react";
import React, { useState } from "react";
import { useAsyncList } from "@react-stately/data";
import { localBackend } from "@/core/api/axiosInstance";
import { useRouter } from "next/navigation";
import { accountRoutes, masterRoutes } from "@/core/api/apiRoutes";
import { useMutation } from "@tanstack/react-query";
import { postData } from "@/core/api/apiHandler";
import { toast } from "sonner";
import SearchInput from "@/components/AutoComplete";
import { D } from "@tanstack/react-query-devtools/build/legacy/ReactQueryDevtoolsPanel-D9deyZtU";

export default function CreateFom() {
  const [user, setUser] = useState<any>({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [notAdmin, setNotAdmin] = useState<any>(null);
  const [loadingUser, setloadingUser] = useState<boolean>(false);
  const createUser = useMutation({
    mutationKey: ["create-user"],
    mutationFn: async (userData: any) => {
      return await postData(accountRoutes.createUser, {}, userData);
    },
    onSuccess: (data: any) => {
      console.log(data.data.data);
      toast.success("User Created", {
        position: "top-right",
        className: "bg-green-500 text-white",
      });
      router.push("/admin");
      setloadingUser(false);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error("User Creation failed", {
        position: "top-right",
      });
      setloadingUser(false);
    },
  });
  const router = useRouter();
  const handleChange = (value: any, type: any) => {
    setUser((prev: any) => ({
      ...prev,
      [type]: value,
    }));
  };
  let list: any = useAsyncList({
    async load({ filterText }) {
      let res = await fetch(
        `${localBackend}role/all/roles/?search=${filterText}`,
        {},
      );

      let json = await res.json();
      const admin = json.data.filter((d: any) => d.name === "ADMIN");
      setNotAdmin(admin[0]._id);
      return {
        items: json.data,
      };
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setloadingUser(true);
    createUser.mutate(user);
  };

  console.log(user, "user");

  return (
    <div className="flex flex-col justify-center h-[60vh] items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-xl w-full font-bold text-user">
          Create User
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Name"
              type="text"
              isRequired
              placeholder="Write Name"
              value={user.name}
              onChange={(e) => handleChange(e.target.value, "name")}
            />
            <Input
              label="Email"
              type="email"
              isRequired
              placeholder="Write Email"
              value={user.email}
              onChange={(e) => handleChange(e.target.value, "email")}
            />
            <Input
              label="Password"
              type="password"
              isRequired
              placeholder="Write Password"
              value={user.password}
              onChange={(e) => handleChange(e.target.value, "password")}
            />
            <Autocomplete
              className="max-w-xl"
              inputValue={list.filterText}
              isLoading={list.isLoading}
              items={list.items}
              isRequired={true}
              onSelectionChange={(e) => handleChange(e, "role")}
              label="Select Role"
              variant="bordered"
              onInputChange={list.setFilterText}
            >
              {(item: any) => (
                <AutocompleteItem key={item._id} className="capitalize">
                  {item.name}
                </AutocompleteItem>
              )}
            </Autocomplete>
            {user.role && user.role !== notAdmin && (
              <div className="flex flex-col gap-2">
                {list.items.find((item: any) => item.id === user.role)?.name ===
                  "SUPPLIER" && (
                  <SearchInput
                    label="Supplier"
                    api={`${masterRoutes.getSupplier}`}
                    type="supplier"
                    state={user.supplier}
                    setState={handleChange}
                  />
                )}
                <SearchInput
                  label="Client"
                  api={`${masterRoutes.getClient}`}
                  type="client"
                  state={user.client}
                  setState={handleChange}
                />
              </div>
            )}
            <Button isLoading={loadingUser} type="submit" color="primary">
              Submit
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
