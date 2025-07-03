import PurchaseOrderRepo from "../database/repositories/purchaseOrderRepo";
import { Request, Response } from "express";
import LiRepo from "../database/repositories/liRepo";
import { LineItemCreate } from "../interfaces/lineItemInterface";

class PurchaseOrderService {
  private poRepo: PurchaseOrderRepo;
  private liRepo: LiRepo;
  constructor() {
    this.poRepo = new PurchaseOrderRepo();
    this.liRepo = new LiRepo();
  }
  public async createPo(req: Request, res: Response) {
    try {
      const { po }: any = req.body;
      const poObject = await this.poRepo.createPurchaseOrder(po);
      return res.sendFormatted(poObject, "Purchase Order Object Created", 200);
    } catch (error) {
      return res.sendError(
        "Error while creating po",
        "Error while creating po",
        400,
      );
    }
  }

  public async deletePOById(req: Request, res: Response) {
    try {
      const id: any = req.params.id;

      if (!id) {
        return res.sendError("Id not found", "Id not found", 404);
      }

      const deletedPO = await this.poRepo.deletePurchaseOrderById(id);
      return res.sendFormatted(deletedPO, "PO deleted successfully", 200);
    } catch (error) {
      return res.sendError(error, "Error while deleteing po", 400);
    }
  }

  //Repo call to fetch all the POs
  public async getPO(req: Request, res: Response) {
    try {
      const page = parseInt(req.params.page);
      const offset = parseInt(req.params.offset);

      if (isNaN(page) || isNaN(offset) || page <= 0 || offset <= 0) {
        return res.sendError(
          "Invalid pagination parameters",
          "Bad Request",
          400,
        );
      }

      const pos = await this.poRepo.getAllPO(page, offset);
      return res.sendArrayFormatted(pos, "All POs fetched successfully", 200);
    } catch (error) {
      return res.sendError(error, "Error while getting PO", 400);
    }
  }
  public async getopenPO(req: Request, res: Response) {
    try {
      const page = parseInt(req.params.page);
      const offset = parseInt(req.params.offset);

      if (isNaN(page) || isNaN(offset) || page <= 0 || offset <= 0) {
        return res.sendError(
          "Invalid pagination parameters",
          "Bad Request",
          400,
        );
      }

      const pos = await this.poRepo.getOpenPO(page, offset);
      return res.sendArrayFormatted(pos, "All POs fetched successfully", 200);
    } catch (error) {
      return res.sendError(error, "Error while getting PO", 400);
    }
  }
  //Repo call to fetch the PO by id
  public async getPOById(req: Request, res: Response) {
    try {
      const id: any = req.params.id;

      if (!id) {
        return res.sendError("id not found", "id not found", 404);
      }

      const PO = await this.poRepo.getPOByID(id);
      return res.sendFormatted(PO, "PO fetched successfully", 200);
    } catch (error) {
      res.sendError(error, "Error while fetching PO", 400);
    }
  }

  public async getNonAcceptedPoLi(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.sendError("Error while no user", "No Token", 400);
      }
      const { _id, name, client, supplier } = req.user;
      const poId = req.params.poId;
      const lineItems = await this.liRepo.getNonAcceptedLineItem(
        poId,
        supplier,
      );
      return res.sendArrayFormatted(lineItems, "Fetched Line Items", 200);
    } catch (error) {
      return res.sendError(
        "Error while getting error",
        "Line Items not getting correctly",
        400,
      );
    }
  }
  public async getNonAcceptedLi(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.sendError("Error while no user", "No Token", 400);
      }
      const { _id, name, client, supplier } = req.user;
      const purchaseOrder = await this.poRepo.getNonAcceptedPo(supplier);

      return res.sendArrayFormatted(
        purchaseOrder,
        "Fetched All Purchase Orders",
        200,
      );
    } catch (error) {
      return res.sendError("Cant Send Po", "Error while getting pos", 400);
    }
  }

  public async acceptLineItem(req: Request, res: Response) {
    try {
      const lineItem = req.params.liId;
      if (!req.user) {
        return res.sendError("Error while not user", "User not signed up", 400);
      }
      const { ssn, supplier_readliness_date }: any = req.body;

      const { _id, client, supplier, name }: any = req.user;
      const acceptLineItem = await this.liRepo.accepteLineItem(
        lineItem,
        supplier_readliness_date,
        supplier,
        ssn,
      );
      return res.sendFormatted(acceptLineItem, "Line Item Accepted", 200);
    } catch (error) {
      return res.sendError(
        "Error while accepting line item",
        "Error while accepting line item",
        400,
      );
    }
  }

  public async createLineItem(req: Request, res: Response) {
    try {
      const poId = req.params.poId;

      const li: any = req.body;

      const { exw_date, order_date } = await this.poRepo.getExwDate(
        poId,
        li.date_required,
      );
      const object: LineItemCreate = {
        ...li,
        purchaseOrder: poId,
        order_date,
        total_cost: li.qty * li.unit_cost,
        exw_date,
      };

      const createLineItem = await this.liRepo.createLineItem(object);
      if (createLineItem) {
        await this.poRepo.pushLineItem(poId, createLineItem._id);
      }
      return res.sendFormatted(createLineItem, "Line Item Added", 200);
    } catch (error) {
      return res.sendError(error, "Error while creating line item", 400);
    }
  }

  public async getLI(req: Request, res: Response) {
    try {
      const page = parseInt(req.params.page);
      const offset = parseInt(req.params.offset);

      if (isNaN(page) || isNaN(offset) || page <= 0 || offset <= 0) {
        return res.sendError(
          "Invalid pagination parameters",
          "Bad Request",
          400,
        );
      }

      const pos = await this.liRepo.getAllLineItems(page, offset);
      return res.sendArrayFormatted(pos, "All LIs fetched successfully", 200);
    } catch (error) {
      return res.sendError(error, "Error while getting LI", 400);
    }
  }

  public async getOpenLI(req: Request, res: Response) {
    try {
      const page = parseInt(req.params.page);
      const offset = parseInt(req.params.offset);

      if (isNaN(page) || isNaN(offset) || page <= 0 || offset <= 0) {
        return res.sendError(
          "Invalid pagination parameters",
          "Bad Request",
          400,
        );
      }

      const pos = await this.liRepo.getOpenLineItems(page, offset);
      return res.sendArrayFormatted(pos, "Open LIs fetched successfully", 200);
    } catch (error) {
      return res.sendError(error, "Error while getting Open LI", 400);
    }
  }

  public async getDispatchedLI(req: Request, res: Response) {
    try {
      const page = parseInt(req.params.page);
      const offset = parseInt(req.params.offset);

      if (isNaN(page) || isNaN(offset) || page <= 0 || offset <= 0) {
        return res.sendError(
          "Invalid pagination parameters",
          "Bad Request",
          400,
        );
      }

      const pos = await this.liRepo.getDispatchedLineItems(page, offset);
      return res.sendArrayFormatted(
        pos,
        "DispatchedLIs fetched successfully",
        200,
      );
    } catch (error) {
      return res.sendError(error, "Error while getting Dispatched LI", 400);
    }
  }
}

export default PurchaseOrderService;
