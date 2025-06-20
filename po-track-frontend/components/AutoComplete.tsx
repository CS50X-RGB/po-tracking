import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useAsyncList } from "@react-stately/data";
import { localBackend } from "@/core/api/axiosInstance";
import { getData } from "@/core/api/apiHandler";
import { masterRoutes } from "@/core/api/apiRoutes";

interface SearchInputProps {
  api: string;
  label: string;
  type: string;
  state: string;
  setState: (e: string, type: string) => void;
}

export default function SearchInput({
  api,
  label,
  state,
  type,
  setState,
}: SearchInputProps) {
  const list = useAsyncList({
    async load({ filterText }) {
      try {
        const res = await getData(`${api}?search=${filterText}`, {});
        if (api === masterRoutes.getClients) {
          return {
            items: res.data.data.client ?? [],
          };
        } else if (api.startsWith(masterRoutes.getAllClientBranches)) {
          return {
            items: res.data.data.clientBranches ?? [],
          };
        } else if (
          api.startsWith(masterRoutes.getPaymentTerms) ||
          api.startsWith(masterRoutes.getSupplier)
        ) {
          return {
            items: res.data.data.data ?? [],
          };
        }
        // Ensure `json.data` is an array before returning
        if (!Array.isArray(res.data.data)) {
          console.error("Expected json.data to be an array", res.data.data);
          return { items: [] };
        }

        return {
          items: res.data.data,
        };
      } catch (err) {
        console.error("Error fetching autocomplete data:", err);
        return { items: [] };
      }
    },
  });

  return (
    <Autocomplete
      className="max-w-xl"
      inputValue={list.filterText}
      isLoading={list.isLoading}
      items={list.items}
      isRequired
      onSelectionChange={(e) => {
        if (typeof e === "string") setState(e, type);
      }}
      label={label}
      variant="bordered"
      onInputChange={list.setFilterText}
    >
      {(item: any) => (
        <AutocompleteItem key={item._id} className="capitalize">
          {item.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
