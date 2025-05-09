import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URI!;
  
interface MongooseConn {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConn = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null
    };
}

export const connect = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            dbName: 'mdb_clerk',
            bufferCommands: false,
            connectTimeoutMS: 30000
        };

        cached.promise = mongoose.connect(MONGODB_URL, opts);
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error('MongoDB connection error:', error);
        throw error;
    }
};