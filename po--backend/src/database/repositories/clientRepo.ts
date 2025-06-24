import mongoose, { ObjectId } from "mongoose";
import {
  ClientCreate,
  ClientBranchCreate,
} from "../../interfaces/clientInterface";
import Client from "../models/client";
import ClientBranchModel from "../models/clientBranchModel";
import PaymentTerms from "../models/paymentTerms";
import FrieghtTermsModel from "../models/frieghtTermsModel";
import { RoleInterface } from "../../interfaces/roleInterface";

class ClientRepo {
  constructor() {}
  public async createClient(client: ClientCreate) {
    try {
      const clientObj = await Client.create(client);
      return clientObj?.toObject();
    } catch (error) {
      throw new Error(`Error while creatin client`);
    }
  }
  public async getEntity<T>(
    type: "Client" | "Client_Branch" | "Payment_Term" | "Frieght_Term",
    name: string,
  ): Promise<T | null> {
    try {
      switch (type) {
        case "Client":
          return await Client.findOne({ name }).lean<T>().exec();
        case "Client_Branch":
          return await ClientBranchModel.findOne({ name }).lean<T>().exec();
        case "Payment_Term":
          return await PaymentTerms.findOne({ name }).lean<T>().exec();
        case "Frieght_Term":
          return await FrieghtTermsModel.findOne({ name }).lean<T>().exec();
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error fetching entity of type ${type}:`, error);
      throw error;
    }
  }

  public async createPaymentOrFrieght(
    name: RoleInterface,
    type: "frieght" | "payment",
  ) {
    try {
      if (type === "frieght") {
        const newFrieght = await FrieghtTermsModel.create(name);
        return newFrieght.toObject();
      } else if (type === "payment") {
        console.log("Creating Payment Term:", name);
        const newPayment = await PaymentTerms.create(name);
        return newPayment.toObject();
      }
      throw new Error("Invalid type provided.");
    } catch (err: any) {
      console.error("Error creating payment or frieght term:", err);
      throw new Error(`Error while creating ${type} term`);
    }
  }

  public async checkByName(name: string, type: "frieght" | "payment") {
    try {
      if (type === "payment") {
        const orgEntity = await PaymentTerms.findOne({ name });
        return !!orgEntity;
      } else if (type === "frieght") {
        const orgEntity = await FrieghtTermsModel.findOne({ name });
        return !!orgEntity;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async getAllModels(type: "frieght" | "payment", name: string = "") {
    try {
      const filter: any = {};

      if (name.trim() !== "") {
        filter.name = { $regex: name, $options: "i" };
      }

      if (type === "frieght") {
        const frieghtTerms = await FrieghtTermsModel.find(filter).lean();
        return {
          data: frieghtTerms,
        };
      } else if (type === "payment") {
        const paymentTerms = await PaymentTerms.find(filter).lean();
        return {
          data: paymentTerms,
        };
      }

      return [];
    } catch (error: any) {
      console.error("Error fetching models:", error);
      throw new Error(`Error while getting all models`);
    }
  }

  public async getAllClientByName(prefix: string = "") {
    try {
      const filter = prefix
        ? { name: { $regex: `^${prefix}`, $options: "i" } }
        : {};

      const client = await Client.find(filter).lean();
      const total = await Client.countDocuments();

      return {
        client,
        total,
      };
    } catch (error) {
      throw new Error(`Error while getting clients`);
    }
  }

  public async getAllClient(page: number, offset: number) {
    try {
      const client = await Client.find()
        .skip((page - 1) * offset)
        .limit(offset);
      const total = await Client.countDocuments();
      return {
        client,
        total,
      };
    } catch (error) {
      throw new Error(`Error while getting clients`);
    }
  }

  public async getAllClientBranch(id: any, page: number, offset: number) {
    try {
      const client = await Client.findById(id);
      const total = await ClientBranchModel.countDocuments({ client: id });

      const clientBranches = await ClientBranchModel.find({ client: id })
        .skip((page - 1) * offset)
        .limit(offset);

      return {
        client,
        clientBranches,
        total,
      };
    } catch (error) {
      throw new Error(`Error while getting client branches: ${error}`);
    }
  }
  public async getAllClientBranches(id: any, name: string = "") {
    try {
      const client = await Client.findById(id);

      const filter: any = { client: id };

      if (name.trim() !== "") {
        filter.name = { $regex: `^${name}`, $options: "i" };
      }

      const total = await ClientBranchModel.countDocuments(filter);
      const clientBranches = await ClientBranchModel.find(filter);

      return {
        client,
        clientBranches,
        total,
      };
    } catch (error: any) {
      throw new Error(`Error while getting client branches: ${error.message}`);
    }
  }

  public async deleteClient(id: ObjectId) {
    try {
      const removeClient = await Client.findByIdAndDelete(id);
      return removeClient?.toObject();
    } catch (error) {
      throw new Error(`Error while removing client`);
    }
  }

  public async createClientBranch(clientBranch: ClientBranchCreate) {
    try {
      const newClientBranchName = await ClientBranchModel.create(clientBranch);
      return newClientBranchName?.toObject();
    } catch (error) {
      throw new Error("Error while creating branch");
    }
  }

  public async deleteClientBranch(id: ObjectId) {
    try {
      const removeClientBranch = await ClientBranchModel.findByIdAndDelete(id);
      return removeClientBranch?.toObject();
    } catch (error) {
      throw new Error(`Error while deleting client branch`);
    }
  }
}

export default ClientRepo;
