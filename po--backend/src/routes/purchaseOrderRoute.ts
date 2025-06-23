import { Router } from "express";
import PoService from "../services/purchaseOrderService";

const router = Router();
const poService = new PoService();

router.post("/new/create", poService.createPo.bind(poService));

router.get('/all',poService.getPO.bind(poService))

router.get('/all/:id',poService.getPOById.bind(poService));

router.delete('/delete/:id',poService.deletePOById.bind(poService))


router.post("/new/add/li/:poId", poService.createLineItem.bind(poService));

export default router;
