import { Router } from "express";
import ProgressUpdateService from "../services/progressUpdateservice";

const router = Router();

const progressUpdateservice = new ProgressUpdateService();

router.post(
  "/rawMaterial/create/:progressUpdateId",
  progressUpdateservice.createRawMaterial.bind(progressUpdateservice),
);

router.patch(
  "/rawMaterial/update/:rawMaterialId",
  progressUpdateservice.updateRawMaterial.bind(progressUpdateservice),
);

router.get("/test", (req, res) => {
  res.send("Progress Update API is working");
});

export default router;
