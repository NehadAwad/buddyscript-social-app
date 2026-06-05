import dotenv from "dotenv";
import path from "path";

const backendDir = path.resolve(__dirname, "../..");
const rootDir = path.resolve(backendDir, "..");

dotenv.config({ path: path.join(backendDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env") });
