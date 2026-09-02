import { App } from "./lib/App.ts";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./helpers/swagger-spec.ts";
import { UserRoutes } from "./users/user-routes.ts";
import { AuthRoutes } from "./auth/auth-routes.ts";
import { ServiceRoutes } from "./service/service-routes.ts";
import { MessageRoutes } from "./support/message-routes.tsx";

class ExpressApp extends App {
  public routes(): void {
    this.app.get("/", (__, res) => {
      res.json({ message: "Server is live" });
    });

    this.app.use(
      "/api/v1/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec),
    );

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
}, express());
const { app } = newApp;

export default app;
