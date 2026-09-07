import app from "../src/app.js";
import { AppHelpers } from "../src/helpers/app-helpers.js";
let databaseConnection;
export default async function handler(req, res) {
    databaseConnection ??= AppHelpers.connectDb().catch((error) => {
        databaseConnection = undefined;
        throw error;
    });
    await databaseConnection;
    app(req, res);
}
