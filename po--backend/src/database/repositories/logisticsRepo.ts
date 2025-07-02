import ProgressUpdateModel from "../models/progressUpdateModel";
import LogisticsModel from "../models/logisticsModel";

class LogisticsRepo {
  public async createLogistics(progressUpdateId: any) {
    try {
      const progressUpdate: any =
        await ProgressUpdateModel.findById(progressUpdateId).populate("LI");
      if (progressUpdate) {
        const createLogistics = await LogisticsModel.create({
          wms: progressUpdate.wms,
          purchaseOrder: progressUpdate.LI.purchaseOrder,
          cipl: progressUpdate.cipl,
          supplier: progressUpdate.supplier,
        });
        return createLogistics.toObject();
      }
      return null;
    } catch (error) {
      throw new Error(`Error while creating Logistics`);
    }
  }

  public async getLogistics(page: number, offset: number) {
    try {
      const logistics = await LogisticsModel.find()
        .populate("wms cipl supplier purchaseOrder")
        .skip((page - 1) * offset)
        .limit(offset)
        .lean();
      const count = await LogisticsModel.countDocuments();
      return { logistics, total: count };
    } catch (error) {
      throw new Error(`Error while getting Logistics`);
    }
  }
}

export default LogisticsRepo;
