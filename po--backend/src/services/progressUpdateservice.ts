import rawMaterial from "../database/models/rawMaterial";
import { rawMaterialInterface } from "../interfaces/rawMaterialInterface";
import { Request, Response } from "express";
import ProgressUpdateRepo from "../database/repositories/progressUpdateRepo";
import {
  rawMaterialStatus,
  rawMaterialSources,
} from "../database/models/rawMaterial";
import { String } from "aws-sdk/clients/pcs";
import progressUpdateModel from "../database/models/progressUpdateModel";
import { underProcessStatus } from "../database/models/underProcessModel";

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
  public async createProgressUpdate(req: Request, res: Response) {
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
