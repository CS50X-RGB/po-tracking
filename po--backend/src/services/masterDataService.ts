import ClientRepo from "../database/repositories/clientRepo";
import SupplierRepo from "../database/repositories/supplierRepo";
import { Request, Response } from "express";
import { RoleInterface } from "../interfaces/roleInterface";

class MasterDataService {
  private clientRepo: ClientRepo;
  private supplierRepo: SupplierRepo;
  constructor() {
    this.clientRepo = new ClientRepo();
    this.supplierRepo = new SupplierRepo();
  }

  public async createPaymentTermsorFrieghtTerms(
    names: RoleInterface[],
    type: "payment" | "frieght",
  ) {
    try {
      for (const n of names) {
        const check = await this.clientRepo.checkByName(n.name, type);
        if (!check) {
          const newEntity = await this.clientRepo.createPaymentOrFrieght(
            n,
            type,
          );
          console.log(`✅ Created new ${type} term: ${newEntity?.name}`);
        } else {
          console.log(`⚠️ ${type} term "${n.name}" already exists`);
        }
      }
    } catch (error: any) {
      console.error("🔥 Error creating terms:", error);
      throw new Error(`Error while creating new entity: ${error.message}`);
    }
  }

  public async getPaymentTermsOrFrieghtTerms(req: Request, res: Response) {
    try {
      const name = (req.query.search as string) || "";
      const type: any = req.params.type;

      const list = await this.clientRepo.getAllModels(type, name);
      return res.sendArrayFormatted(list, "Fetched All Items", 200);
    } catch (error) {
      return res.sendError(
        "Error while getting all models",
        "Error while all models",
        400,
      );
    }
  }
  public async getAllSuppliers(req: Request, res: Response) {
    try {
      const name = (req.query.search as string) || "";

      const list = await this.supplierRepo.getAllSupplierBranchesByName(name);
      return res.sendArrayFormatted(list, "All Suppliers", 200);
    } catch (error) {
      return res.sendError(
        "Error while getting all suppliers",
        "Error while getting supplier",
        400,
      );
    }
  }
  public async createClient(req: Request, res: Response) {
    try {
      const { client }: any = req.body;
      console.log(req.body);
      console.log(client);
      const newClient = await this.clientRepo.createClient(client);
      return res.sendFormatted(newClient, "New Client", 200);
    } catch (error) {
      return res.sendError(error, "Error while creating client", 400);
    }
  }

  public async createClientBranch(req: Request, res: Response) {
    try {
      const { clientId }: any = req.params;
      const { clientBranch }: any = req.body;
      const newBranch = {
        client: clientId,
        name: clientBranch.name,
        exw_date: clientBranch.exw_date,
      };
      const newClientBranchName =
        await this.clientRepo.createClientBranch(newBranch);
      return res.sendFormatted(
        newClientBranchName,
        "New Client Branch Created",
        200,
      );
    } catch (error) {
      return res.sendError(
        "Error while creating branch name",
        "Error while creating client branch name",
        400,
      );
    }
  }

  public async getAllClients(req: Request, res: Response) {
    try {
      const page: any = Number(req.params.page) as 1;
      const offset: any = Number(req.params.offset) | 10;

      const newClient = await this.clientRepo.getAllClient(page, offset);
      return res.sendArrayFormatted(newClient, "Client Fetched", 200);
    } catch (error) {
      return res.sendError(
        "Error while getting client",
        "Error while getting clients",
        400,
      );
    }
  }
  public async getAllClientsByName(req: Request, res: Response) {
    try {
      const name = (req.query.search as string) || "";
      const newClient = await this.clientRepo.getAllClientByName(name);
      return res.sendArrayFormatted(newClient, "Client Fetched", 200);
    } catch (error) {
      return res.sendError(
        "Error while getting client",
        "Error while getting clients",
        400,
      );
    }
  }
  public async getAllClientsBranchByName(req: Request, res: Response) {
    try {
      const { clientId }: any = req.params;
      const name = (req.query.search as string) || "";
      const newClientBranch = await this.clientRepo.getAllClientBranches(
        clientId,
        name,
      );
      return res.sendArrayFormatted(
        newClientBranch,
        "Client  Branches Fetched",
        200,
      );
    } catch (error) {
      return res.sendError(
        "Error while getting client",
        "Error while getting client branches",
        400,
      );
    }
  }
  public async getAllClientsBranch(req: Request, res: Response) {
    try {
      const { clientId }: any = req.params;
      const page: any = Number(req.params.page) as 1;
      const offset: any = Number(req.params.offset) | 10;

      const newClientBranch = await this.clientRepo.getAllClientBranch(
        clientId,
        page,
        offset,
      );
      return res.sendArrayFormatted(
        newClientBranch,
        "Client  Branches Fetched",
        200,
      );
    } catch (error) {
      return res.sendError(
        "Error while getting client",
        "Error while getting client branches",
        400,
      );
    }
  }
  public async deleteClientBranch(req: Request, res: Response) {
    try {
      const { clientBranchId }: any = req.params;
      const clientBranch =
        await this.clientRepo.deleteClientBranch(clientBranchId);
      return res.sendFormatted(clientBranch, "Deleted Branch", 200);
    } catch (error) {
      return res.sendError(
        `Error while deleting`,
        "Delwting client branch",
        400,
      );
    }
  }
  public async createSupplier(req: Request, res: Response) {
    try {
      const { supplier }: any = req.body;

      const newSupplier = await this.supplierRepo.createSupplier(supplier);
      return res.sendFormatted(newSupplier, "New Supplier", 200);
    } catch (error) {
      return res.sendError(error, "Error while creating Supplier", 400);
    }
  }
  public async createSupplierBranch(req: Request, res: Response) {
    try {
      const { supplierId }: any = req.params;
      const { supplierBranch }: any = req.body;
      const newBranch = {
        supplier: supplierId,
        name: supplierBranch.name,
      };
      const newSupplierBranchName =
        await this.supplierRepo.createSupplierBranch(newBranch);
      return res.sendFormatted(
        newSupplierBranchName,
        "New Client Branch Created",
        200,
      );
    } catch (error) {
      return res.sendError(
        "Error while creating branch name",
        "Error while creating supplier branch name",
        400,
      );
    }
  }
  public async getAllSupplier(req: Request, res: Response) {
    try {
      const page: any = Number(req.params.page) as 1;
      const offset: any = Number(req.params.offset) | 10;

      const newSupplier = await this.supplierRepo.getAllSupplier(page, offset);
      return res.sendArrayFormatted(newSupplier, "Supplier Fetched", 200);
    } catch (error) {
      return res.sendError(
        "Error while getting supplier",
        "Error while getting suppliers",
        400,
      );
    }
  }
  public async getAllSupplierBranch(req: Request, res: Response) {
    try {
      const { supplierId }: any = req.params;
      const page: any = Number(req.params.page) as 1;
      const offset: any = Number(req.params.offset) | 10;

      const newSupplierBranch = await this.supplierRepo.getAllSupplierBranch(
        supplierId,
        page,
        offset,
      );
      return res.sendArrayFormatted(
        newSupplierBranch,
        "Supplier  Branches Fetched",
        200,
      );
    } catch (error) {
      return res.sendError(
        "Error while getting supplier",
        "Error while getting supplier branches",
        400,
      );
    }
  }
  public async deleteSupplierBranch(req: Request, res: Response) {
    try {
      const { supplierBranchId }: any = req.params;
      const supplierBranch =
        await this.supplierRepo.deleteSupplierBranch(supplierBranchId);
      return res.sendFormatted(supplierBranch, "Deleted Branch", 200);
    } catch (error) {
      return res.sendError(
        `Error while deleting`,
        "Delwting supplier branch",
        400,
      );
    }
  }
}

export default MasterDataService;
