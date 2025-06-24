import { Router } from "express";
import PoService from "../services/purchaseOrderService";
import ImporterService from "../services/importerService";
import { uploadFile } from "../utils/upload";

const router = Router();
const poService = new PoService();
const importService = new ImporterService();

router.post("/new/create", poService.createPo.bind(poService));

router.get("/all/:page/:offset", poService.getPO.bind(poService));

router.get("/single/:id", poService.getPOById.bind(poService));

router.delete("/delete/:id", poService.deletePOById.bind(poService));

router.post("/new/add/li/:poId", poService.createLineItem.bind(poService));

router.post(
  "/import/all",
  uploadFile.single("file"),
  importService.createPurchaseOrder.bind(importService),
);
export default router;
