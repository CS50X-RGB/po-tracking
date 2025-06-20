import Router from "express";
import MasterDataRepo from "../services/masterDataService";
import UserMiddleware from "../middleware/userMiddleware";

const router = Router();
const masterData = new MasterDataRepo();
const userMiddleware = new UserMiddleware();

router.post("/create/client", masterData.createClient.bind(masterData));
router.post(
  "/create/client_branch/:clientId",
  masterData.createClientBranch.bind(masterData),
);
router.get("/client/:page/:offset", masterData.getAllClients.bind(masterData));
router.get(
  "/client/clientId/:clientId/:page/:offset",
  masterData.getAllClientsBranch.bind(masterData),
);
router.delete(
  "/client/delete/:clientBranchId",
  masterData.deleteClientBranch.bind(masterData),
);

router.post("/create/supplier", masterData.createSupplier.bind(masterData));
router.post(
  "/create/supplier_branch/:supplierId",
  masterData.createSupplierBranch.bind(masterData),
);
router.get(
  "/get/supplier/:page/:offset",
  masterData.getAllSupplier.bind(masterData),
);
router.get(
  "/supplier/supplierId/:supplierId/:page/:offset",
  masterData.getAllSupplierBranch.bind(masterData),
);

router.delete(
  "/client/delete/:supplierBranchId",
  masterData.deleteSupplierBranch.bind(masterData),
);

router.get(
  "/get/entity/:type",
  masterData.getPaymentTermsOrFrieghtTerms.bind(masterData),
);

router.get("/get/clients/", masterData.getAllClientsByName.bind(masterData));
router.get(
  "/get/client_branch/:clientId",
  masterData.getAllClientsBranchByName.bind(masterData),
);

router.get("/get/supplier/", masterData.getAllSuppliers.bind(masterData));
export default router;
