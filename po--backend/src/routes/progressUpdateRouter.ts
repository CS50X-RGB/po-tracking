import { Router } from "express";
import ProgressUpdateService from "../services/progressUpdateservice";
import UserMiddleware from "../middleware/userMiddleware";

const router = Router();

const progressUpdateservice = new ProgressUpdateService();
const userMiddleware = new UserMiddleware();

router.post(
  "/rawMaterial/create/:progressUpdateId",
  progressUpdateservice.createRawMaterial.bind(progressUpdateservice),
);

router.patch(
  "/rawMaterial/update/:rawMaterialId",
  progressUpdateservice.updateRawMaterial.bind(progressUpdateservice),
);

router.get(
  "/all/supplier-progress",
  userMiddleware.verify.bind(userMiddleware),
  progressUpdateservice.getProgressUpdate.bind(progressUpdateservice),
);
export default router;
