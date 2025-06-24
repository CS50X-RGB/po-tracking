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
      const formattedData: PoCreateExcel[] = sheetData.map((row: any) => ({
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
      }));
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
