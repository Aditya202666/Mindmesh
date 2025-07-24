import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDb = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("DB connected"));
        // mongoose.connection.on("error", (error) =>
        //     console.log(`error in mongoDb: ${error}`)
        // );
        // mongoose.connection.on("disconnected", () =>
        //      console.log("DB disconnected")
        // );

        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URL}/${DB_NAME}`
        );
        // console.log(
        //     `MongoDb connected to host: ${connectionInstance.connection.host}`
        // );
    } catch (error) {
        // console.log(`error in connectDb: ${error.message}`);
    }
};

export { connectDb };
  