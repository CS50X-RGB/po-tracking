"use client";
import { Input } from "@heroui/input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import * as XLSX from "xlsx";
import { poRoutes } from "@/core/api/apiRoutes";
import { postData } from "@/core/api/apiHandler";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

export default function ImportPurchaseOrder() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const importData = useMutation({
    mutationKey: ["import_data_po"],
    mutationFn: async (data: FormData) => {
      return await postData(poRoutes.importPo, {}, data);
    },
    onMutate: () => {
      setisLoading(true);
    },
    onSettled: () => {
      setisLoading(false);
    },
    onSuccess: (data: any) => {
      console.log(data.data, "File Data");
      router.push("/admin/po/view");
    },
    onError: (error: any) => {
      console.error(error, "Error");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    const reader = new FileReader();
    reader.onload = (evt: any) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawJson = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const normalizedData = rawJson.map((row: any) => {
        return {
          po_name: row["PO Number"],
          client: row["Client Name"],
          client_branch: row["Client Branch"],
          payment_term: row["Payment Terms"],
          freight_term: row["Freight Terms"],
          order_date: row["Order Date"],
          supplier: row["Supplier"],
          name: row["Line Item Number"],
          currency: row["Currency"],
          part_number: row["Part Number"],
          line_item_type: row["Line Item type"],
          priority: row["Priority"],
          uom: row["Unit of Measurement"],
          qty: row["Quantity"],
          unit_price: row["Unit Price"],
          date_required: row["Date Required"],
        };
      });

      console.log("Normalized Data:", normalizedData);
    };

    reader.readAsBinaryString(file);
  };
  const handleBomImport = () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    importData.mutate(formData);
  };

  return (
    <div className="flex flex-col p-4 gap-4 w-full">
      <h1 className="text-xl font-bold">Import Purchase Orders</h1>
      <Input
        type="file"
        className="w-1/4 p-4 cursor-pointer"
        accept=".xlsx"
        onChange={handleFileChange}
      />
      {file && (
        <div className="w-1/3 flex flex-col p-4">
          <h1 className="text-green-500 font-bold">
            File Imported Successfully
          </h1>
          <Button
            isLoading={isLoading}
            color="primary"
            onPress={() => handleBomImport()}
          >
            Import File
          </Button>
        </div>
      )}
    </div>
  );
}
