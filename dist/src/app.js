import { App } from "./lib/App.js";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./helpers/swagger-spec.js";
import { UserRoutes } from "./users/user-routes.js";
import { AuthRoutes } from "./auth/auth-routes.js";
import { ServiceRoutes } from "./service/service-routes.js";
import { MessageRoutes } from "./support/message-routes.js";
class ExpressApp extends App {
    routes() {
        this.app.get("/", (__, res) => {
            res.json({ message: "Server is live" });
        }, express());
        this.app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        this.app.use("/api/v1/users", new UserRoutes().routes);
        this.app.use("/api/v1/auth", new AuthRoutes().routes);
        this.app.use("/api/v1/services", new ServiceRoutes().routes);
        this.app.use("/api/v1/messages", new MessageRoutes().routes);
    }
}
const newApp = new ExpressApp({
    origin: [
        "http://localhost:5173",
        "https://ajike-pest-control-tau.vercel.app",
    ],
    credentials: true,
});
const { app } = newApp;
export default app;
