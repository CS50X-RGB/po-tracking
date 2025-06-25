import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/encrypt";
import RoleModel from "../database/models/roleModel";
import Supplier from "../database/models/supplier";
import Client from "../database/models/client";

class UserMiddleware {
  constructor() {}
  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, client, supplier } = req.body;

      // Validate required fields
      if (!name || !email || !password || !role) {
        return res.sendError(null, "Invalid fields", 400);
      }

      // Fetch role by ID
      const roleObj = await RoleModel.findById(role).lean();

      // If role is ADMIN, client and supplier must not be present
      if (roleObj && roleObj.name === "ADMIN") {
        if (client || supplier) {
          return res.sendError(
            null,
            "ADMIN users must not be assigned a client or supplier",
            400,
          );
        }
      } else {
        // For non-admin roles, client and supplier are required
        if (!client || !supplier) {
          return res.sendError(
            null,
            "Client and Supplier are required for non-ADMIN users",
            400,
          );
        }

        const clientObj = await Client.findOne({ name: client }).lean();
        const supplierObj = await Supplier.findOne({ name: supplier }).lean();

        if (!clientObj || !supplierObj) {
          return res.sendError(null, "Invalid client or supplier", 400);
        }

        // Attach to request
        req.body.client = clientObj;
        req.body.supplier = supplierObj;
      }

      next();
    } catch (e) {
      console.error("Error in createUser middleware:", e);
      return res.sendError(null, `Error while creating user`, 500);
    }
  }

  public async verifyAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.sendError(null, "Invalid authorization header", 400);
      }
      const token = authHeader.split(" ")[1];
      const decoded: any = await verifyToken(token);
      if (decoded.role === "ADMIN") {
        req.user = {
          _id: decoded._id,
          name: decoded.name,
        };
        next();
      } else {
        return res.sendError(null, "Only Admin Create Users", 400);
      }
    } catch (error: any) {
      throw new Error(`Error while Verifying`);
    }
  }
  public async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.sendError(null, "Invalid authorization header", 400);
      }
      const token = authHeader.split(" ")[1];
      const decoded: any = await verifyToken(token);
      if (decoded.role !== "ADMIN") {
        req.user = {
          _id: decoded._id,
          name: decoded.name,
        };
        next();
      } else {
        return res.sendError(null, "Your not Admin", 400);
      }
    } catch (error: any) {
      throw new Error(`Error while Verifying`);
    }
  }
  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password } = req.body;
      if (!name || !password) {
        return res.sendError(null, "Invalid fields", 400);
      }
      next();
    } catch (e: any) {
      throw new Error(`Error while logging user ${e}`);
    }
  }
  public async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, password, email, role } = req.body;
      if (!name || !password || !email || !role) {
        return res.sendError(null, "Invalid fields", 400);
      }
      next();
    } catch (e: any) {
      throw new Error(`Error while signing user ${e}`);
    }
  }
  public async deleteId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.sendError(null, "Id for object not send", 400);
      }
      next();
    } catch (error) {
      return res.sendError(error, "Error while sending id", 500);
    }
  }
}
export default UserMiddleware;
