import { Request, Response } from "express";
import * as XLSX from "xlsx";
import fs from "fs";
import PurchaseOrderRepo from "../database/repositories/purchaseOrderRepo";
import { PoCreateExcel } from "../interfaces/poInterface";

class ImportService {
  private purchaseOrderRepo: PurchaseOrderRepo;
  constructor() {
    this.purchaseOrderRepo = new PurchaseOrderRepo();
  }
  public async createPurchaseOrder(req: Request, res: Response) {
    if (!req.file) {
      return res.sendError("File is missing", "File is not send", 400);
    }
    try {
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet);
      fs.unlink(req.file.path, (err) => {
        if (err) console.log("File Deletion Failed:", err);
      });
      function excelSerialToDate(serial: number): string {
        const excelEpoch = new Date(1899, 11, 30);
        const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
        const year = jsDate.getFullYear();
        const month = String(jsDate.getMonth() + 1).padStart(2, "0");
        const day = String(jsDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      const formattedData: PoCreateExcel[] = sheetData.map((row: any) => {
        const isSerialDate = (val: any) =>
          typeof val === "number" && !isNaN(val);

        const trimIfString = (val: any) =>
          typeof val === "string" ? val.trim() : val;

        const formatDate = (val: any) =>
          isSerialDate(val) ? excelSerialToDate(val) : trimIfString(val);

        return {
          po_name: trimIfString(row["PO Number"]),
          client: trimIfString(row["Client Name"]),
          client_branch: row["Client Branch"],
          payment_term: trimIfString(row["Payment Terms"]),
          freight_term: trimIfString(row["Freight Terms"]),
          order_date: formatDate(row["Order Date"]),
          supplier: trimIfString(row["Supplier"]),
          name: row["Line Item Number"],
          currency: trimIfString(row["Currency"]),
          part_number: row["Part Number"],
          line_item_type: trimIfString(row["Line Item type"]),
          priority: trimIfString(row["Priority"]),
          uom: trimIfString(row["Unit of Measurement"]),
          qty: row["Quantity"],
          unit_price: row["Unit Price"],
          date_required: formatDate(row["Date Required"]),
        };
      });

      console.log(formattedData, "data");
      const { po, count } =
        await this.purchaseOrderRepo.createImportEntities(formattedData);
      return res.sendArrayFormatted(
        po,
        `Created ${count} Purchase Orders`,
        200,
      );
    } catch (error) {
      return res.sendError(error, "Error while creating part Numbers", 500);
    }
  }
}
export default ImportService;
