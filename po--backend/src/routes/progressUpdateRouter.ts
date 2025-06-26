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

router.post(
  "/underProcess/create/:progressUpdateId",
  progressUpdateservice.createProgressUpdate.bind(progressUpdateservice),
);

router.get(
  "/all/supplier-progress",
  userMiddleware.verify.bind(userMiddleware),
  progressUpdateservice.getProgressUpdate.bind(progressUpdateservice),
);

// router.patch(
//   "/rawMaterial/update/:rawMaterialId",
//   progressUpdateservice.updateRawMaterial.bind(progressUpdateservice),
// );

export default router;
