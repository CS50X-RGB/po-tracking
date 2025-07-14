import { Router } from "express";
import PoService from "../services/purchaseOrderService";
import ImporterService from "../services/importerService";
import { uploadFile } from "../utils/upload";
import UserMiddleware from "../middleware/userMiddleware";

const router = Router();
const poService = new PoService();
const importService = new ImporterService();
const userMiddleware = new UserMiddleware();
router.post("/new/create", poService.createPo.bind(poService));

router.get(
  "/all/:page/:offset",
  userMiddleware.verify.bind(userMiddleware),
  poService.getPO.bind(poService),
);

router.get("/single/:id", poService.getPOById.bind(poService));

router.delete("/delete/:id", poService.deletePOById.bind(poService));

router.post("/new/add/li/:poId", poService.createLineItem.bind(poService));

router.post(
  "/import/all",
  uploadFile.single("file"),
  importService.createPurchaseOrder.bind(importService),
);

router.get(
  "/non-accepted/",
  userMiddleware.verify.bind(userMiddleware),
  poService.getNonAcceptedLi.bind(poService),
);

router.get(
  "/li/not-accepted/:poId",
  userMiddleware.verify.bind(userMiddleware),
  poService.getNonAcceptedPoLi.bind(poService),
);

router.put(
  "/li/accept/:liId",
  userMiddleware.verify.bind(userMiddleware),
  poService.acceptLineItem.bind(poService),
);

//get open PO
router.get("/open/:page/:offset", poService.getopenPO.bind(poService));

router.get("/li/all/:page/:offset", poService.getLI.bind(poService));

router.get("/li/open/:page/:offset", poService.getOpenLI.bind(poService));

router.get(
  "/li/dispatched/:page/:offset",
  poService.getDispatchedLI.bind(poService),
);

router.get(
  "/supplier/all/:page/:offset",
  userMiddleware.verify.bind(userMiddleware),
  poService.getPO.bind(poService),
);

router.get(
  "/supplier/open/:page/:offset",
  userMiddleware.verify.bind(userMiddleware),
  poService.getopenPO.bind(poService),
);

router.get(
  "/li/supplier/all/:page/:offset",
  userMiddleware.verify.bind(userMiddleware),
  poService.getLI.bind(poService),
);

router.get(
  "/li/supplier/open/:page/:offset",
  userMiddleware.verify.bind(userMiddleware),
  poService.getOpenLI.bind(poService),
);

router.get(
  "/li/supplier/dispatched/:page/:offset",
  userMiddleware.verify.bind(userMiddleware),
  poService.getDispatchedLI.bind(poService),
);

router.put(
  "/li/supplier/change/date/:liId",
  userMiddleware.verify.bind(userMiddleware),
  poService.changeLineItemDate.bind(poService),
);

export default router;
