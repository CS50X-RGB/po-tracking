import ProgressUpdateModel, {
  DeliveryStatus,
} from "../models/progressUpdateModel";
import LogisticsModel, { LogisticsStatus } from "../models/logisticsModel";
import LineItemModel, { LineItemStatus } from "../models/lineItemModel";

class LogisticsRepo {
  public async createLogistics(progressUpdateId: any) {
    try {
      const progressUpdate: any =
        await ProgressUpdateModel.findById(progressUpdateId).populate("LI");
      if (progressUpdate) {
        const createLogistics = await LogisticsModel.create({
          wms: progressUpdate.wms,
          line_item: progressUpdate._id,
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
  public async updateLogistics(id: any, data: any) {
    try {
      const updatedLogisctics: any = await LogisticsModel.findOneAndUpdate(
        { _id: id },
        data,
        { new: true },
      ).populate("line_item");
      const progressUpdateModal = updatedLogisctics?.line_item;
      const delivery_status: any = progressUpdateModal?.delivery_status;

      let line_item_status: LineItemStatus = "Active";
      if (data.delivery_status === LogisticsStatus.DELIVERED) {
        if (delivery_status === "Partially Dispatched") {
          line_item_status = "Partially Delivered";
        } else if (delivery_status === "Shortclosed") {
          line_item_status = "ShortClosed";
        } else {
          line_item_status = "Delivered";
        }
      }
      const lineItemId = progressUpdateModal?.LI?._id;

      if (lineItemId) {
        await LineItemModel.updateOne(
          { _id: lineItemId },
          {
            $set: {
              line_item_status: line_item_status,
            },
          },
        );
      }
      return updatedLogisctics;
    } catch (error) {
      console.log(error, "error");
      throw new Error(`Error while updating logistics`);
    }
  }
  public async getLogistics(page: number, offset: number) {
    try {
      const logistics = await LogisticsModel.find()
        .populate("wms cipl supplier purchaseOrder")
        .populate({
          path: "line_item",
          populate: {
            path: "LI",
          },
        })
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
