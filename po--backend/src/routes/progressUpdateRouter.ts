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
  progressUpdateservice.createUnderProcess.bind(progressUpdateservice),
);
router.post(
  "/underSpecialProcess/create/:progressUpdateId",
  progressUpdateservice.createUnderSpecialProcess.bind(progressUpdateservice),
);
router.post(
  "/finalInspection/create/:progressUpdateId",
  progressUpdateservice.createFinalInspection.bind(progressUpdateservice),
);

router.post(
  "/cipl/create/:progressUpdateId",
  progressUpdateservice.createCipl.bind(progressUpdateservice),
);

router.get(
  "/all/supplier-progress",
  userMiddleware.verify.bind(userMiddleware),
  progressUpdateservice.getProgressUpdate.bind(progressUpdateservice),
);
router.get(
  "/single/supplier-progress/:poId",
  userMiddleware.verify.bind(userMiddleware),
  progressUpdateservice.getProgressUpdateSingle.bind(progressUpdateservice),
);

router.get(
  "/client/getNonApprove",
  userMiddleware.verify.bind(userMiddleware),
  progressUpdateservice.getProgressUpdatesNotApproved.bind(
    progressUpdateservice,
  ),
);

router.put(
  "/client/approve/qd/:puId",
  userMiddleware.verify.bind(userMiddleware),
  progressUpdateservice.updateQdByClient.bind(progressUpdateservice),
);
// router.patch(
//   "/rawMaterial/update/:rawMaterialId",
//   progressUpdateservice.updateRawMaterial.bind(progressUpdateservice),
// );

export default router;
