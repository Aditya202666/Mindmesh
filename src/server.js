import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDb } from "./db/connectDb.js";
import { port } from "./constant.js";

dotenv.config();

(async () => {
    try {
        await connectDb();
        app.listen(port, () => {
            // console.log(`Server is Running: http://localhost:${port}`);
        });
    } catch (error) {
        // console.log(`error in server.js ${error}`);
        process.exit(1);
    }
})();
 