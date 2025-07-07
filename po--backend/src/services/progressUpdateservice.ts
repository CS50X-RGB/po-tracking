import rawMaterial from "../database/models/rawMaterial";
import { rawMaterialInterface } from "../interfaces/rawMaterialInterface";
import { Request, Response } from "express";
import ProgressUpdateRepo from "../database/repositories/progressUpdateRepo";
import {
  rawMaterialStatus,
  rawMaterialSources,
} from "../database/models/rawMaterial";
import progressUpdateModel, {
  DeliveryStatus,
} from "../database/models/progressUpdateModel";
import { underProcessStatus } from "../database/models/underProcessModel";
import { underSpecialProcessStatus } from "../database/models/underSpecialProcessModel";
import { isQualityCheckCompletedEnum } from "../database/models/finalInspection";
import LogisticsRepo from "../database/repositories/logisticsRepo";

class ProgressUpdateService {
  private progressUpdateRepo: ProgressUpdateRepo;
  private logisticsRepo: LogisticsRepo;
  constructor() {
    this.progressUpdateRepo = new ProgressUpdateRepo();
    this.logisticsRepo = new LogisticsRepo();
  }

  public async createCipl(req: Request, res: Response) {
    try {
      const { progressUpdateId } = req.params;
      const { dispatchedQty, ...rest }: any = req.body;
      const progressUpdate = await this.progressUpdateRepo.createCipl(
        progressUpdateId,
        dispatchedQty,
        rest,
      );
      return res.sendFormatted(progressUpdate, "Updated Progress Update", 200);
    } catch (error) {
      return res.sendError(
        "Error while updating progress update",
        "Progress Update Failed",
        400,
      );
    }
  }

  public async createRawMaterial(req: Request, res: Response) {
    try {
      //getting progress update id of line item thorugh params
      const { progressUpdateId } = req.params;
      const { source, RMstatus, planDate, inStock, received, actualDate } =
        req.body;

      const errors: String[] = [];

      //getting qunatity info
      const qtyInfo =
        await this.progressUpdateRepo.getQtyInfo(progressUpdateId);
      if (!qtyInfo) {
        return res.sendError("Progress update not found", "Not Found", 404);
      }

      const { openqty, qty } = qtyInfo;

      //if status is open and source is imported
      if (
        source === rawMaterialSources.IMPORTED &&
        RMstatus === rawMaterialStatus.OPEN
      ) {
        if (inStock === null) errors.push("instock quantity is required");
        if (!planDate) errors.push("plan date is required");
      }

      //if status is in-transit  and source is imported
      if (
        source === rawMaterialSources.IMPORTED &&
        RMstatus === rawMaterialStatus.INTRANSIST
      ) {
        if (!planDate) errors.push("planDate is required");
        if (inStock == null) errors.push("inStock is required");
        //if (received == null) errors.push("received quantity is required");
      }

      //if status is partial received and source is imported
      if (
        source === rawMaterialSources.IMPORTED &&
        RMstatus === rawMaterialStatus.PARTIALRECEIVED
      ) {
        if (!planDate) errors.push("planDate is required");
        if (inStock == null) errors.push("inStock is required");
        if (received == null) errors.push("received quantity is required");
        if (!actualDate) errors.push("actualDate is required");

        if (errors.length > 0) {
          return res.sendError(errors, "Validation failed", 400);
        }
      }

      //if status is received and source is imported
      if (
        source === rawMaterialSources.IMPORTED &&
        RMstatus === rawMaterialStatus.RECEIVED
      ) {
        if (!planDate) errors.push("planDate is required");
        if (inStock == null) errors.push("inStock is required");
        if (received == null) errors.push("received is required");
        if (!actualDate) errors.push("actualDate is required");
        if (received != qty)
          errors.push(
            "received quantity does not match the total required quantity",
          );
      }

      if (errors.length > 0) {
        return res.sendError(errors, "Validation failed", 400);
      }
      const rm_obj = {
        source,
        RMstatus,
        planDate,
        inStock,
        received,
        actualDate,
      };
      const rm_id: any = await this.progressUpdateRepo.checkEntity(
        progressUpdateId,
        "RM",
      );
      let created;
      if (rm_id) {
        created = await this.progressUpdateRepo.updateRawMaterial(
          rm_id,
          rm_obj,
        );
      } else {
        created = await this.progressUpdateRepo.createRawMaterial(
          progressUpdateId,
          rm_obj,
        );
      }

      return res.sendFormatted(
        created,
        "Raw material progress created sucessfully",
        200,
      );

      //progress upddate ka id params m ->if
    } catch (error) {
      console.log(error);
      return res.sendError(
        "Server Error",
        "Failed to create raw material",
        500,
      );
    }
  }

  public async managePostDelivery(req: Request, res: Response) {
    try {
      const puId = req.params.puId;
      const { action, ...obj }: any = req.body;
      console.log(action, obj, "body", puId);
      let progressUpdate;

      switch (action) {
        case "1":
          progressUpdate = await this.progressUpdateRepo.createWMS(puId, obj);
          break;

        case "2":
          progressUpdate = await this.progressUpdateRepo.updateDeliveryDefer(
            puId,
            obj.tentative_planned_date,
            DeliveryStatus.DeliveryOnHold,
          );
          break;

        default:
          progressUpdate = await this.progressUpdateRepo.updateDeliveryDefer(
            puId,
            obj.tentative_planned_date,
            DeliveryStatus.DeferDelivery,
          );
          break;
      }

      return res.sendFormatted(progressUpdate, "Updated Progress Update", 200);
    } catch (error) {
      throw new Error(`Error while managing post delivery: ${error}`);
    }
  }

  //ProgressUpdate service function
  public async createUnderProcess(req: Request, res: Response) {
    try {
      //getting progress update id of line item thorugh params
      const { progressUpdateId } = req.params;
      const {
        type,
        UPstatus,
        completedQuantity,
        pendingQuantity,
        actualDate,
        planDate,
      } = req.body;

      const errors: String[] = [];

      //if status is open
      if (UPstatus === underProcessStatus.OPEN) {
        if (!planDate) errors.push("plan date is required");
      }

      //if status is in-progress
      if (UPstatus === underProcessStatus.INPROGRESS) {
        if (!planDate) errors.push("planDate is required");
        if (completedQuantity == null)
          errors.push("completedQuantity is required");
      }

      //if status is partial COMPLETED
      if (UPstatus === underProcessStatus.PARTIALLY_COMPLETED) {
        if (!planDate) errors.push("planDate is required");
        if (completedQuantity == null)
          errors.push("completedQuantity is required");
        if (!actualDate) errors.push("actualDate is required");
      }

      //if status is COMPLETED
      if (UPstatus === underProcessStatus.COMPLETED) {
        if (!planDate) errors.push("planDate is required");
        if (completedQuantity == null)
          errors.push("completedQuantity is required");
        if (!actualDate) errors.push("actualDate is required");
      }

      if (errors.length > 0) {
        return res.sendError(errors, "Validation failed", 400);
      }

      const up_obj = {
        type,
        UPstatus,
        completedQuantity,
        pendingQuantity,
        actualDate,
        planDate,
      };

      const up_id: any = await this.progressUpdateRepo.checkEntity(
        progressUpdateId,
        "UP",
      );
      let created;

      if (up_id) {
        created = await this.progressUpdateRepo.updateUnderProcess(
          up_id,
          up_obj,
        );
      } else {
        created = await this.progressUpdateRepo.createUnderProcess(
          progressUpdateId,
          up_obj,
        );
      }

      return res.sendFormatted(
        created,
        "underProcess progress created sucessfully",
        200,
      );
    } catch (error) {
      console.log(error);
      return res.sendError(
        "Server Error",
        "Failed to create ProgressUpdate",
        500,
      );
    }
  }

  public async createUnderSpecialProcess(req: Request, res: Response) {
    try {
      //getting progress update id of line item thorugh params
      const { progressUpdateId } = req.params;
      const {
        type,
        USPstatus,
        completedQuantity,
        pendingQuantity,
        actualDate,
        planDate,
      } = req.body;

      const errors: String[] = [];

      //if status is open
      if (USPstatus === underSpecialProcessStatus.OPEN) {
        if (!planDate) errors.push("plan date is required");
      }

      //if status is in-progress
      if (USPstatus === underSpecialProcessStatus.INPROGRESS) {
        if (!planDate) errors.push("planDate is required");
        if (completedQuantity == null)
          errors.push("completedQuantity is required");
      }

      //if status is partial COMPLETED
      if (USPstatus === underSpecialProcessStatus.PARTIALLY_COMPLETED) {
        if (!planDate) errors.push("planDate is required");
        if (completedQuantity == null)
          errors.push("completedQuantity is required");
        if (!actualDate) errors.push("actualDate is required");
      }

      //if status is COMPLETED
      if (USPstatus === underSpecialProcessStatus.COMPLETED) {
        if (!planDate) errors.push("planDate is required");
        if (completedQuantity == null)
          errors.push("completedQuantity is required");
        if (!actualDate) errors.push("actualDate is required");
      }

      if (errors.length > 0) {
        return res.sendError(errors, "Validation failed", 400);
      }

      const usp_obj = {
        type,
        USPstatus,
        completedQuantity,
        pendingQuantity,
        actualDate,
        planDate,
      };

      const usp_id: any = await this.progressUpdateRepo.checkEntity(
        progressUpdateId,
        "USP",
      );
      let created;

      if (usp_id) {
        created = await this.progressUpdateRepo.updateUnderSpecialProcess(
          usp_id,
          usp_obj,
        );
      } else {
        created = await this.progressUpdateRepo.createUnderSpecialProcess(
          progressUpdateId,
          usp_obj,
        );
      }

      return res.sendFormatted(
        created,
        "underSpecialProcess progress created sucessfully",
        200,
      );
    } catch (error) {
      console.log(error);
      return res.sendError(
        "Server Error",
        "Failed to create underSpecialProcess",
        500,
      );
    }
  }

  public async createFinalInspection(req: Request, res: Response) {
    try {
      //getting progress update id of line item thorugh params
      const { progressUpdateId } = req.params;
      const { isQualityCheckCompleted, QDLink } = req.body;

      const errors: String[] = [];

      if (isQualityCheckCompleted == isQualityCheckCompletedEnum.YES) {
        if (QDLink == null) errors.push("QD link cannot be null");
      }

      if (errors.length > 0) {
        return res.sendError(errors, "Validation failed", 400);
      }

      const fi_obj = {
        isQualityCheckCompleted,
        QDLink,
      };

      const fi_id: any = await this.progressUpdateRepo.checkEntity(
        progressUpdateId,
        "FI",
      );
      let created;

      if (fi_id) {
        created = await this.progressUpdateRepo.updateFinalInspection(
          fi_id,
          fi_obj,
        );
      } else {
        created = await this.progressUpdateRepo.createFinalInspection(
          progressUpdateId,
          fi_obj,
        );
      }

      return res.sendFormatted(
        created,
        "final inspection progress created sucessfully",
        200,
      );
    } catch (error) {
      console.log(error);
      return res.sendError(
        "Server Error",
        "Failed to create final inspection",
        500,
      );
    }
  }

  public async getProgressUpdate(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.sendError("Not Logged In", "Not Logged In", 400);
      }
      const { _id, supplier, client, name } = req.user;
      const getProgressUpdateEntites =
        await this.progressUpdateRepo.getAllProgressUpdate(
          null,
          supplier,
          null,
        );
      return res.sendArrayFormatted(
        getProgressUpdateEntites,
        "Got All Entites",
        200,
      );
    } catch (error) {
      return res.sendError(
        "Error while getting the progress update",
        "Getting Progress Update",
        400,
      );
    }
  }

  public async getProgressUpdateSingle(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.sendError("Not Logged In", "Not Logged In", 400);
      }
      const poId = req.params.poId;
      const { _id, supplier, client, name } = req.user;
      const getProgressUpdateEntity =
        await this.progressUpdateRepo.getAllProgressUpdate(
          null,
          supplier,
          poId,
        );
      return res.sendFormatted(
        getProgressUpdateEntity,
        "Got Single Entity",
        200,
      );
    } catch (error) {
      return res.sendError(
        "Error while getting the progress update",
        "Getting Progress Update",
        400,
      );
    }
  }

  public async getProgressUpdatesNotApproved(req: Request, res: Response) {
    try {
      const getProgressUpdateNotApproved =
        await this.progressUpdateRepo.getItemsByStatus(
          DeliveryStatus.ReadyForInspection,
        );
      return res.sendArrayFormatted(
        getProgressUpdateNotApproved,
        "Got Progress Update Not Updated",
        200,
      );
    } catch (error) {
      throw new Error(`Error while getting the progress updates not approved`);
    }
  }

  public async updatePu(req: Request, res: Response) {
    try {
      const { puId }: any = req.params;
      let updatedPu = null;
      const { dispatched_date }: any = req.body;
      if (req.body.status) {
        updatedPu = await this.progressUpdateRepo.finalStatus(
          puId,
          dispatched_date,
          req.body.status,
        );
      } else {
        updatedPu = await this.progressUpdateRepo.finalStatus(
          puId,
          dispatched_date,
        );
      }
      return res.sendFormatted(updatedPu, "Updated Progress Update", 200);
    } catch (error) {
      return res.sendError(
        `Error while updating progress update`,
        "Updating Progress Update Failed",
        400,
      );
    }
  }

  public async manageCIPL(req: Request, res: Response) {
    try {
      const nonCiplEntities = await this.progressUpdateRepo.getItemsByStatus([
        DeliveryStatus.ClearedForShipping,
        DeliveryStatus.CIPLUnderReview,
        DeliveryStatus.CIPLUnderADMReview,
        DeliveryStatus.CIPLReviewedAndSubmittedToADM,
        DeliveryStatus.CIPLReviewedAndRejected,
      ]);
      return res.sendArrayFormatted(
        nonCiplEntities,
        "Got Cleared For Shipping Entites",
        200,
      );
    } catch (error) {
      throw new Error(`Error while getting cipl update`);
    }
  }

  public async updateStatus(req: Request, res: Response) {
    try {
      const puId = req.params.puId;
      const { status } = req.body;
      const progressUpdate = await this.progressUpdateRepo.updateStatus(
        puId,
        status,
      );
      return res.sendFormatted(progressUpdate, "Updated Progress Update", 200);
    } catch (error) {
      return res.sendError(
        `Error while updating CIPL`,
        "Updating CIPL Error",
        400,
      );
    }
  }

  public async manageDelivery(req: Request, res: Response) {
    try {
      const deliveryManage = await this.progressUpdateRepo.getItemsByStatus(
        DeliveryStatus.ReadyAndPacked,
      );
      return res.sendArrayFormatted(
        deliveryManage,
        "Got Delivered Entities",
        200,
      );
    } catch (error) {
      throw new Error(`Error while getting delivery`);
    }
  }
  public async updateQdByClient(req: Request, res: Response) {
    try {
      const { approved }: any = req.body;
      const puId: any = req.params.puId;
      let updatedPu: any = null;

      if (approved === "Yes") {
        updatedPu = await this.progressUpdateRepo.updateStatus(
          puId,
          DeliveryStatus.QDApproved,
        );
      } else if (approved === "No") {
        updatedPu = await this.progressUpdateRepo.updateStatus(
          puId,
          DeliveryStatus.QDRejected,
        );
      }
      return res.sendFormatted(updatedPu, "Updated Progress Update", 200);
    } catch (error) {
      return res.sendError(
        "Error while updating progress update",
        "Error while updating progress update",
        400,
      );
    }
  }

  public async updateLogistics(req: Request, res: Response) {
    try {
      const { logid } = req.params;
      const { data } = req.body;
      const updatedLogistics = await this.logisticsRepo.updateLogistics(
        logid,
        data,
      );
      return res.sendFormatted(updatedLogistics, "Updated Logistics", 200);
    } catch (error) {
      return res.sendError(
        `Error while updating error`,
        "Error while updating error",
        400,
      );
    }
  }

  public async getLogistics(req: Request, res: Response) {
    try {
      const { page, offset }: any = req.params;
      const logistics = await this.logisticsRepo.getLogistics(page, offset);
      return res.sendArrayFormatted(logistics, "Got Logistics", 200);
    } catch (error) {
      return res.sendError(
        `Error while getting logistics`,
        "Logistics Error",
        400,
      );
    }
  }

  public async getOpenPo(req: Request, res: Response) {
    try {
      let openPo = [];
      if (req.query.status && req.query.status != "") {
        openPo = await this.progressUpdateRepo.getAllProgressUpdate(
          req.query.status,
        );
      } else {
        openPo = await this.progressUpdateRepo.getAllProgressUpdate();
      }
      return res.sendArrayFormatted(openPo, "Fetched Purchase Orders", 200);
    } catch (error) {
      return res.sendError(
        `Error while getting open po`,
        "Open Po fetching error",
        400,
      );
    }
  }
  // public async updateRawMaterial(req: Request, res: Response) {
  //   try {
  //     const { rawMaterialId } = req.params;
  //     const { source, RMstatus, planDate, inStock, received, actualDate } =
  //       req.body;

  //     const errors: string[] = [];

  //     if (
  //       source === rawMaterialSources.IMPORTED &&
  //       RMstatus === rawMaterialStatus.OPEN
  //     ) {
  //       if (inStock == null) errors.push("instock quantity is required");
  //       if (!planDate) errors.push("plan date is required");
  //     }

  //     if (
  //       source === rawMaterialSources.IMPORTED &&
  //       RMstatus === rawMaterialStatus.INTRANSIST
  //     ) {
  //       if (!planDate) errors.push("planDate is required");
  //       if (inStock == null) errors.push("inStock is required");
  //     }

  //     if (
  //       source === rawMaterialSources.IMPORTED &&
  //       RMstatus === rawMaterialStatus.PARTIALRECEIVED
  //     ) {
  //       if (!planDate) errors.push("planDate is required");
  //       if (inStock == null) errors.push("inStock is required");
  //       if (received == null) errors.push("received quantity is required");
  //       if (!actualDate) errors.push("actualDate is required");
  //     }

  //     if (
  //       source === rawMaterialSources.IMPORTED &&
  //       RMstatus === rawMaterialStatus.RECEIVED
  //     ) {
  //       if (!planDate) errors.push("planDate is required");
  //       if (inStock == null) errors.push("inStock is required");
  //       if (received == null) errors.push("received quantity is required");
  //       if (!actualDate) errors.push("actualDate is required");
  //     }

  //     if (errors.length > 0) {
  //       return res.sendError(errors, "Validation failed", 400);
  //     }

  //     // Call your repo to update
  //     const updated = await this.progressUpdateRepo.updateRawMaterial(
  //       rawMaterialId,
  //       {
  //         source,
  //         RMstatus,
  //         planDate,
  //         inStock,
  //         received,
  //         actualDate,
  //       },
  //     );

  //     if (!updated) {
  //       return res.sendError(
  //         "Not Found",
  //         "Raw Material not found or update failed",
  //         404,
  //       );
  //     }

  //     return res.sendFormatted(
  //       updated,
  //       "Raw Material updated successfully",
  //       200,
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     return res.sendError(
  //       "Server Error",
  //       "Failed to update Raw Material",
  //       500,
  //     );
  //   }
  // }
}

export default ProgressUpdateService;
