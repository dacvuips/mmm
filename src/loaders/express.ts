import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";
import next from "next";

import { configs } from "../configs";
import { swaggerSpec, swaggerTheme } from "../configs/swagger";
import router from "../routers-old";
import routerv2 from "../routers";

import agendash from "agendash";
import basicAuth from "express-basic-auth";
import { Agenda } from "../scheduler/agenda";

export default ({ app }: { app: express.Application }) => {
  app.use(cors());

  app.set("port", configs.port);
  app.use(compression());
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
  app.use(
    morgan("short", { skip: (req: Request) => /(_ah\/health)|graphql/.test(req.originalUrl) })
  );

  app.set("view engine", "hbs");
  app.set("views", path.join(__dirname, "/../../public/views"));
  app.use("/public", express.static(path.join(__dirname, "../../public")));

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: swaggerTheme }));

  app.get("/swagger.json", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // app.get("/", function (req: Request, res: Response) {
  //   res.send(`${configs.name} - ${configs.version} - ${configs.description}`);
  // });

  if (configs.agenda.enableDash) {
    console.log("setup agendash");
    app.use("/agenda", [
      basicAuth({
        users: { [configs.agenda.auth.username]: configs.agenda.auth.password },
        challenge: true,
      }),
      agendash(Agenda),
    ]);
  }

  app.use("/", router);
  app.use("/", routerv2);

  const nextApp = next({ dev: configs.nextDev, dir: "./next" });
  const handle = nextApp.getRequestHandler();
  nextApp.prepare().then(() => {
    console.log("Next App Initialized!");
    app.all("*", (req, res) => handle(req, res));
  });
};
