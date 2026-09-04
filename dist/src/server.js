import http from "node:http";
import app from "./app.js";
import { Server } from "socket.io";
import { listen } from "./support/socket.js";
import { PORT } from "./lib/constants.js";
import { AppHelpers } from "./helpers/app-helpers.js";
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "https://ajike-pest-control.vercel.app",
    },
});
async function startServer() {
    await AppHelpers.connectDb();
    httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    listen(io);
}
startServer();
