import { Router } from "express";
import PoService from "../services/purchaseOrderService";

const router = Router();
const poService = new PoService();

router.post("/new/create", poService.createPo.bind(poService));

export default router;
