import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/config';
import partNumberModel from './models/partNumberModel';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        const result = await partNumberModel.syncIndexes();
        console.log('Index sync result:', result);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};

export default connectDB;
