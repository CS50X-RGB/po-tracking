import rawMaterial from "../database/models/rawMaterial";
import { rawMaterialInterface } from "../interfaces/rawMaterialInterface";
import { Request, Response } from "express";
import ProgressUpdateRepo from "../database/repositories/progressUpdateRepo";
import {
  rawMaterialStatus,
  rawMaterialSources,
} from "../database/models/rawMaterial";
import { String } from "aws-sdk/clients/pcs";
import progressUpdateModel, {
  DeliveryStatus,
} from "../database/models/progressUpdateModel";
import { underProcessStatus } from "../database/models/underProcessModel";
import { underSpecialProcessStatus } from "../database/models/underSpecialProcessModel";
import { isQualityCheckCompletedEnum } from "../database/models/finalInspection";

class ProgressUpdateService {
  private progressUpdateRepo: ProgressUpdateRepo;

  constructor() {
    this.progressUpdateRepo = new ProgressUpdateRepo();
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
        await this.progressUpdateRepo.getAllProgressUpdate(supplier);
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
        await this.progressUpdateRepo.getAllProgressUpdate(supplier, poId);
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
