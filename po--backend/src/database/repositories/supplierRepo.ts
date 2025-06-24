import mongoose, { ObjectId } from "mongoose";
import {
  SupplierBranchCreate,
  ClientCreate,
} from "../../interfaces/clientInterface";
import Supplier from "../models/supplier";
import SupplierBranch from "../models/supplierBranchModel";

class SupplierRepo {
  constructor() {}
  public async createSupplier(supplier: ClientCreate) {
    try {
      const supplierObj = await Supplier.create(supplier);
      return supplierObj?.toObject();
    } catch (error) {
      throw new Error(`Error while creatin client`);
    }
  }

  public async getSupplier(name: string) {
    try {
      return await Supplier.findOne({
        name,
      }).lean();
    } catch (error) {
      throw new Error(`Error while getting supplier`);
    }
  }

  public async getAllSupplier(page: number, offset: number) {
    try {
      const supplier = await Supplier.find()
        .skip((page - 1) * offset)
        .limit(offset);
      const total = await Supplier.countDocuments();
      return {
        supplier,
        total,
      };
    } catch (error) {
      throw new Error(`Error while getting suppliers`);
    }
  }

  public async getAllSupplierBranch(id: any, page: number, offset: number) {
    try {
      const supplier = await Supplier.findById(id);
      const total = await SupplierBranch.countDocuments({ supplier: id });

      const supplierBranches = await SupplierBranch.find({ supplier: id })
        .skip((page - 1) * offset)
        .limit(offset);

      return {
        supplier,
        supplierBranches,
        total,
      };
    } catch (error) {
      throw new Error(`Error while getting supplier branches: ${error}`);
    }
  }

  public async getAllSuppliersByName(name: string = "") {
    try {
      const filter: any = {};

      if (name.trim() !== "") {
        filter.name = { $regex: `^${name}`, $options: "i" };
      }

      const suppliers = await Supplier.find(filter).lean();
      return suppliers;
    } catch (error: any) {
      throw new Error(`Error while getting suppliers: ${error.message}`);
    }
  }
  public async getAllSupplierBranchesByName(name: string = "") {
    try {
      const filter: any = {};

      if (name.trim() !== "") {
        filter.name = { $regex: `^${name}`, $options: "i" };
      }

      const supplier = await Supplier.find(filter).lean();
      return {
        data: supplier,
      };
    } catch (error: any) {
      throw new Error(
        `Error while getting supplier branches: ${error.message}`,
      );
    }
  }

  public async deleteSupplier(id: ObjectId) {
    try {
      const removeSupplier = await Supplier.findByIdAndDelete(id);
      return removeSupplier?.toObject();
    } catch (error) {
      throw new Error(`Error while removing supplier`);
    }
  }

  public async createSupplierBranch(supplierBranch: SupplierBranchCreate) {
    try {
      const newSupplierBranchName = await SupplierBranch.create(supplierBranch);
      return newSupplierBranchName?.toObject();
    } catch (error) {
      throw new Error("Error while creating branch");
    }
  }

  public async deleteSupplierBranch(id: ObjectId) {
    try {
      const removeSupplierBranch = await SupplierBranch.findByIdAndDelete(id);
      return removeSupplierBranch?.toObject();
    } catch (error) {
      throw new Error(`Error while deleting supplier branch`);
    }
  }
}

export default SupplierRepo;
