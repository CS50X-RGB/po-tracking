import { PartNumberCreationInterface } from "../../interfaces/partNumberInterface";
import PartNumberModel from "../models/partNumberModel";
import { ObjectId } from "mongoose";

class PartNumberRepository {
    constructor() { }

    //function to create the part numbers in bulk
    public async createpartNumbers(partNumberObjects: PartNumberCreationInterface[]) {
        try {
            //Extract all unique descriptions from input
            const descriptions = partNumberObjects.map(p => p.description);

            //Find which descriptions already exist in DB
            const existingDocs = await PartNumberModel.find({
                description: { $in: descriptions }
            }).select('description');

            const existingDescriptions = new Set(existingDocs.map(doc => doc.description));

            //Filter: keep only new ones
            const toInsert = partNumberObjects.filter(
                p => !existingDescriptions.has(p.description)
            );

            //Insert only new ones
            let inserted: any[] = [];
            if (toInsert.length > 0) {
                inserted = await PartNumberModel.insertMany(toInsert, { ordered: false });
            }
            return {
                partNumbers: inserted.map(p => p.toObject()),
                created: inserted.length,
                existing: existingDescriptions.size
            }
        } catch (error) {
            throw Error('Error while creating bulk Part Numbers');
        }
    }
    
    //function to create only signle part number
    public async createPartNumber(partNumberObject: PartNumberCreationInterface) {
        try {
            const partNumber = await PartNumberModel.create(partNumberObject);
            return partNumber.toObject();
        } catch (error) {
            throw new Error(`Error while creating part Number`);
        }
    }
    public async deletePartNumbers(ids: ObjectId[]) {
        try {
            const results = await PartNumberModel.deleteMany({
                _id: { $in: ids }
            });
            return results.deletedCount;
        } catch (error) {
            throw Error('Error while deleting bulk Part Numbers');
        }
    }
    public async deletePartNumberById(id: ObjectId) {
        try {
            const result = await PartNumberModel.findByIdAndDelete(id);
            return result;
        } catch (error) {
            throw Error(`Error delete the part number`);
        }
    }
    public async getPartNumbers(page: number, offset: number, search?: string) {
        try {
            const skip = (page - 1) * offset;
            const query: any = {};
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }
            const partNumber = await PartNumberModel.find(query).skip(skip).limit(offset).lean();
            let count = await PartNumberModel.countDocuments();
            if (search) {
                count = await PartNumberModel.countDocuments(query);
            }
            return {
                partNumbers: partNumber,
                count
            };
        } catch (error) {
            throw Error('Error while deleting bulk Part Numbers');
        }
    }
    public async getPartNumberBySearch(name: string): Promise<any[]> {
        try {
            let query = {};

            if (name && name.trim() !== "") {
                query = {
                    name: { $regex: new RegExp(name.trim(), "i") },
                };
            }

            const partNumbers = await PartNumberModel.find(query);
            return partNumbers;
        } catch (error) {
            throw new Error(`Error while getting Part Numbers`);
        }
    }
    public async getPartNumberIdByName(name: string): Promise<any | null> {
        try {
            const partNumber = await PartNumberModel.findOne({
                name: name
            });
            return partNumber;
        } catch (error) {
            throw Error('Error while getting  Part Number by name');
        }
    }
    public async getPartNumberById(partNumber: any) {
        try {
            const partNumberEntity = await PartNumberModel.findById(partNumber).lean(); // ✅ chain lean() before await
            return partNumberEntity;
        } catch (error) {
            console.error("Error in getPartNumberById:", error);
            throw new Error("Error while getting part number");
        }
    }
    public async countPartNumber() {
        try {
            const countPartNumbers = await PartNumberModel.countDocuments();
            return countPartNumbers;
        } catch (error) {
            throw new Error(`Error while counting part Number`);
        }
    }

}

export default PartNumberRepository;